import React from 'react';

const TestimonialsSection = () => {
    const testimonials = [
        {
            quote: "服務態度極佳，鑽石品質超乎預期，絕對是值得信賴的選擇！",
            author: "王小姐"
        },
        {
            quote: "設計款式獨特，每一顆鑽石都閃耀著璀璨的光芒，非常滿意！",
            author: "陳先生"
        },
        {
            quote: "從選購到收貨，整個過程都非常順暢，客服回應迅速，大推！",
            author: "林先生夫婦"
        }
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">客戶評價</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            <p className="text-lg text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                            <p className="text-right font-semibold text-gray-800">- {testimonial.author}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;