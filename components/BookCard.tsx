"use client";

import Link from "next/link";
import {BookCardProps} from "@/types";
import Image from "next/image";
import {Trash2} from "lucide-react";
import {useTransition} from "react";
import {deleteBook} from "@/lib/actions/book.actions";
import {toast} from "sonner";

const BookCard = ({ id, title, author, coverURL, slug, fileBlobKey, coverBlobKey }: BookCardProps) => {
    const [isPending, startTransition] = useTransition();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            startTransition(async () => {
                try {
                    const result = await deleteBook(id, fileBlobKey, coverBlobKey);
                    if (result.success) {
                        toast.success(`"${title}" deleted successfully`);
                    } else {
                        toast.error(result.error || "Failed to delete book");
                    }
                } catch (error) {
                    console.error("Delete error:", error);
                    toast.error("An error occurred while deleting the book");
                }
            });
        }
    }

    return (
        <div className="relative group">
            <Link href={`/books/${slug}`}>
                <article className="book-card">
                    <figure className="book-card-figure">
                        <div className="book-card-cover-wrapper">
                            <Image src={coverURL} alt={title} width={133} height={200} className="book-card-cover" />
                        </div>

                        <figcaption className="book-card-meta">
                            <h3 className="book-card-title">{title}</h3>
                            <p className="book-card-author">{author}</p>
                        </figcaption>
                    </figure>
                </article>
            </Link>

            <button
                onClick={handleDelete}
                disabled={isPending}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md hover:bg-red-600 disabled:bg-gray-400 z-10 cursor-pointer"
                title="Delete Book"
            >
                <Trash2 size={16} className={isPending ? "animate-pulse" : ""} />
            </button>
        </div>
    )
}
export default BookCard