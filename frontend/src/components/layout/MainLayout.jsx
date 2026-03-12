import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import EmergencyBanner from '../EmergencyBanner';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative w-full overflow-x-hidden">
            <Navbar />
            <main className="flex-1 flex flex-col w-full relative">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
