// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-12">
            <div className="container mx-auto px-4 text-center">
                <p>&copy; {new Date().getFullYear()}  鑽之韻 DIAMOND SYMPHONY. All Rights Reserved.</p>

            </div>
        </footer>
    );
};

export default Footer;