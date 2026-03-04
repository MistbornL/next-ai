import React from 'react'
import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";

const Page = () => {
    return (
        <main className="wrapper container">
            <HeroSection />

            <div className="library-books-grid">
                {books.map((book) => (
                    <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug} />
                ))}
            </div>
        </main>
    )
}
export default Page
