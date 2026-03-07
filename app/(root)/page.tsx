import React, {Suspense} from 'react'
import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import {getAllBooks} from "@/lib/actions/book.actions";
import Search from "@/components/Search";
import PerformanceLogger from "@/components/PerformanceLogger";

const Page = async ({ searchParams }: { searchParams: Promise<{ query?: string }> }) => {
    const { query } = await searchParams;
    const bookResults = await getAllBooks(query)
    const books = bookResults.success ? bookResults.data ?? [] : []

    return (
        <main className="wrapper container">
            <PerformanceLogger 
                timings={bookResults.timings} 
                success={bookResults.success} 
                error={bookResults.error} 
            />
            <HeroSection />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
                <h2 className="text-3xl font-serif font-bold text-[#212a3b]">Recent Books</h2>
                <Suspense fallback={<div>Loading...</div>}>
                    <Search />
                </Suspense>
            </div>

            {/*<div className="library-books-grid">*/}

            {/*    {books.map((book) => (*/}
            {/*        <BookCard key={book._id} id={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug} fileBlobKey={book.fileBlobKey} coverBlobKey={book.coverBlobKey} />*/}
            {/*    ))}*/}
            {/*</div>*/}
        </main>
    )
}

export default Page