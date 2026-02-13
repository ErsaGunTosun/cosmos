import "@/styles/globals.css";

export const metadata = {
    title: "cosmos",
    description: "Minimalist personal photography portfolio",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" style={{ colorScheme: 'light' }}>
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
