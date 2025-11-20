export async function generateStaticParams() {
  return [];
}

export default function BlogPostEN({ params }: { params: { slug: string } }) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Article: {params.slug}</h1>
      <p>Content will be added soon.</p>
    </div>
  );
}
