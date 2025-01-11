import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
// import Page from './page';
function ParentComponent() {
    return (
        <div className="flex items-center w-[100%] h-100 justify-center bg-white">        
            <div className=''>
                <Header />
                <HeroSection />
            </div>
        </div>
    );
}

export default ParentComponent;