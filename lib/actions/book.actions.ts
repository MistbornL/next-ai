'use server';

import {CreateBook, TextSegment} from "@/types";
import {connectToDatabase} from "@/database/mongoose";
import {escapeRegex, generateSlug, serializeData} from "@/lib/utils";
import mongoose from "mongoose";
import {getUserPlan} from "@/lib/subscription.server";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";

export const getAllBooks = async (search?: string) => {
    try {
        await connectToDatabase();

        let query: any = {};

        if (search) {
            const escaped = escapeRegex(search);
            query = {
                $or: [
                    { title: { $regex: escaped, $options: "i" } },
                    { author: { $regex: escaped, $options: "i" } },
                ],
            };
        }

        const books = await Book.find(query)
            .select("title author coverURL slug fileBlobKey coverBlobKey")
            .sort({ createdAt: -1 })
            .limit(30)
            .setOptions({ maxTimeMS: 5000 })
            .lean();

        return {
            success: true,
            data: serializeData(books),
        };
    } catch (e) {
        console.error(e);
        return { success: false, error: e };
    }
};

export const checkBookExists = async (title: string) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(title);

        const existingBook = await Book.findOne({slug}).lean();

        if(existingBook) {
            return {
                exists: true,
                book: serializeData(existingBook)
            }
        }

        return {
            exists: false,
        }
    } catch (e) {
        console.error('Error checking book exists', e);
        return {
            exists: false, error: e
        }
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(data.title);

        const existingBook = await Book.findOne({slug}).lean();

        if(existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true,
            }
        }

        const { auth } = await import("@clerk/nextjs/server");
        const { userId } = await auth();

        if (!userId || userId !== data.clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        const plan = await getUserPlan();
        const { PLAN_LIMITS } = await import("@/lib/subscription-constants");
        const limits = PLAN_LIMITS[plan];

        const bookCount = await Book.countDocuments({ clerkId: userId });

        if (bookCount >= limits.maxBooks) {
            const { revalidatePath } = await import("next/cache");
            revalidatePath("/");

            return {
                success: false,
                error: `You have reached the maximum number of books allowed for your ${plan} plan (${limits.maxBooks}). Please upgrade to add more books.`,
                isBillingError: true,
            };
        }

        const book = await Book.create({...data, clerkId: userId, slug, totalSegments: 0});

        return {
            success: true,
            data: serializeData(book),
        }
    } catch (e) {
        console.error('Error creating a book', e);

        return {
            success: false,
            error: e,
        }
    }
}

export const getBookBySlug = async (slug: string) => {
    try {
        await connectToDatabase();

        const book = await Book.findOne({ slug }).lean();

        if (!book) {
            return { success: false, error: 'Book not found' };
        }

        return {
            success: true,
            data: serializeData(book)
        }
    } catch (e) {
        console.error('Error fetching book by slug', e);
        return {
            success: false, error: e
        }
    }
}

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
    try {
        await connectToDatabase();

        console.log('Saving book segments...');

        const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
            clerkId, bookId, content: text, segmentIndex, pageNumber, wordCount
        }));

        await BookSegment.insertMany(segmentsToInsert);

        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });

        console.log('Book segments saved successfully.');

        return {
            success: true,
            data: { segmentsCreated: segments.length}
        }
    } catch (e) {
        console.error('Error saving book segments', e);

        return {
            success: false,
            error: e,
        }
    }
}

// Searches book segments using MongoDB text search with regex fallback
export const searchBookSegments = async (bookId: string, query: string, limit: number = 5) => {
    try {
        await connectToDatabase();

        console.log(`Searching for: "${query}" in book ${bookId}`);

        const bookObjectId = new mongoose.Types.ObjectId(bookId);

        // Try MongoDB text search first (requires text index)
        let segments: Record<string, unknown>[] = [];
        try {
            segments = await BookSegment.find({
                bookId: bookObjectId,
                $text: { $search: query },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ score: { $meta: 'textScore' } })
                .limit(limit)
                .lean();
        } catch {
            // Text index may not exist — fall through to regex fallback
            segments = [];
        }

        // Fallback: regex search matching ANY keyword
        if (segments.length === 0) {
            const keywords = query.split(/\s+/).filter((k) => k.length > 2);
            const pattern = keywords.map(escapeRegex).join('|');

            segments = await BookSegment.find({
                bookId: bookObjectId,
                content: { $regex: pattern, $options: 'i' },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ segmentIndex: 1 })
                .limit(limit)
                .lean();
        }

        console.log(`Search complete. Found ${segments.length} results`);

        return {
            success: true,
            data: serializeData(segments),
        };
    } catch (error) {
        console.error('Error searching segments:', error);
        return {
            success: false,
            error: (error as Error).message,
            data: [],
        };
    }
};


export const deleteBook = async (id: string, fileBlobKey: string, coverBlobKey?: string) => {
    try {
        await connectToDatabase();

        const { auth } = await import("@clerk/nextjs/server");
        const { userId } = await auth();

        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }

        const book = await Book.findById(id).lean();

        if (!book) {
            return { success: false, error: "Book not found" };
        }

        if (book.clerkId !== userId) {
            return { success: false, error: "Unauthorized: You don't own this book" };
        }

        // 1. Delete associated segments
        await BookSegment.deleteMany({ bookId: id });

        // 2. Delete book from database
        await Book.findByIdAndDelete(id);

        // 3. Delete files from Vercel Blob
        const { del } = await import("@vercel/blob");
        const blobsToDelete = [fileBlobKey];
        if (coverBlobKey) {
            blobsToDelete.push(coverBlobKey);
        }

        await del(blobsToDelete, {
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/");

        return {
            success: true,
            message: "Book deleted successfully"
        }
    } catch (e) {
        console.error('Error deleting book', e);
        return {
            success: false, error: e
        }
    }
}
