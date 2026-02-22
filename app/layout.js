import "@/styles/globals.css";
import SplashScreen from "@/components/layout/SplashScreen";
import { readFileSync } from 'fs';
import path from 'path';

function getConfig() {
    try {
        const fileContents = readFileSync(path.join(process.cwd(), 'data', 'config.json'), 'utf8');
        return JSON.parse(fileContents);
    } catch {
        return {
            theme: 'light',
            custom_colors: { background: '#252422', foreground: '#fffcf2' },
            homepage_sort: 'custom'
        };
    }
}
export const metadata = {
    title: "Noir",
    description: "Minimalist personal photography portfolio — Noir",
};

export default function RootLayout({ children }) {
    const config = getConfig();

    const customStyles = {};
    if (config.theme === 'custom' && config.custom_colors) {
        customStyles['--background'] = config.custom_colors.background;
        customStyles['--foreground'] = config.custom_colors.foreground;
        customStyles['--border'] = config.custom_colors.border;
        customStyles['--muted'] = config.custom_colors.muted;
    }

    return (
        <html lang="en" data-theme={config.theme} style={{ colorScheme: config.theme === 'light' ? 'light' : 'dark', ...customStyles }}>
            <body className="antialiased">
                <SplashScreen>
                    {children}
                </SplashScreen>
            </body>
        </html>
    );
}
