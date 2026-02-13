'use client';

export default function SplashScreen({ children }) {
    return (
        <>
            <div className="splash-overlay">
                <div className="splash-content">
                    <h1 className="splash-title">Noir</h1>
                    <div className="splash-sub">
                        <span className="splash-star">✦</span>
                        <p className="splash-text">Made For Kedi Nur</p>
                    </div>
                </div>
            </div>
            <div className="splash-page">
                {children}
            </div>
        </>
    );
}
