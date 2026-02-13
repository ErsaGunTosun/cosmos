import Container from '../layout/Container';

const SKELETON_HEIGHTS = ['aspect-[3/4]', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-[4/3]'];

export default function GridSkeleton() {
    return (
        <Container className="pb-12">
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-5 [&>*]:mb-5">
                {SKELETON_HEIGHTS.map((aspect, i) => (
                    <div key={i} className={`break-inside-avoid ${aspect} bg-gray-200 animate-pulse`} />
                ))}
            </div>
        </Container>
    );
}
