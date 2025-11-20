export async function generateStaticParams() {
  return []; // потом добавим статьи
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Статья: {params.slug}</h1>
      <p>Контент статьи появится позже.</p>
    </div>
  );
}
