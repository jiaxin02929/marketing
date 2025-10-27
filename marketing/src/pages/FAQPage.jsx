// src/pages/FAQPage.jsx
import React, { useState } from 'react';
import siteContent from '../data/siteContent.json';

const FAQPage = () => {
    const faqCategories = siteContent.faqContent.categories;
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [expandedQuestions, setExpandedQuestions] = useState(new Set());

    const toggleCategory = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const toggleQuestion = (categoryId, questionIndex) => {
        const questionKey = `${categoryId}-${questionIndex}`;
        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(questionKey)) {
            newExpanded.delete(questionKey);
        } else {
            newExpanded.add(questionKey);
        }
        setExpandedQuestions(newExpanded);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8" >
                    常見問題 FAQ
                </h1>

                {/* FAQ 手風琴式列表 */}
                <div className="max-w-4xl mx-auto space-y-2">
                    {faqCategories.map((category) => (
                        <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* 分類標題按鈕 */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full px-6 py-4 text-left bg-gray-100 hover:bg-gray-150 transition-colors duration-200 flex justify-between items-center"
                            >
                                <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                                    {category.label}
                                </h2>
                                <span className="text-2xl text-gray-600 font-light">
                                    {expandedCategories.has(category.id) ? '−' : '+'}
                                </span>
                            </button>

                            {/* 分類內容 */}
                            {expandedCategories.has(category.id) && (
                                <div className="bg-white">
                                    {category.questions.map((question, index) => {
                                        const questionKey = `${category.id}-${index}`;
                                        const isQuestionExpanded = expandedQuestions.has(questionKey);
                                        
                                        return (
                                            <div key={index} className="border-t border-gray-200">
                                                {/* 問題按鈕 */}
                                                <button
                                                    onClick={() => toggleQuestion(category.id, index)}
                                                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
                                                >
                                                    <h3 className="text-base md:text-lg font-medium text-gray-800 pr-4">
                                                        {question.q}
                                                    </h3>
                                                    <span className="text-xl text-gray-500 font-light flex-shrink-0">
                                                        {isQuestionExpanded ? '−' : '+'}
                                                    </span>
                                                </button>

                                                {/* 答案內容 */}
                                                {isQuestionExpanded && (
                                                    <div className="mx-6 mb-4">
                                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                                            <div className="flex">
                                                                <div className="ml-3">
                                                                    <p className="text-gray-800 leading-relaxed font-medium">
                                                                        {question.a}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQPage;