import "@/styles/globals.css";
import SplashScreen from "@/components/layout/SplashScreen";

export const metadata = {
    title: "Noir",
    description: "Minimalist personal photography portfolio — Noir",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" style={{ colorScheme: 'light' }}>
            <body className="antialiased">
                <SplashScreen>
                    {children}
                </SplashScreen>
            </body>
        </html>
    );
}
