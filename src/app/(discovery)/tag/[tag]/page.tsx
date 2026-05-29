import { redirect } from "next/navigation";

type Props = { params: Promise<{ tag: string }> };

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  redirect(`/catalog?tag=${encodeURIComponent(tag.toLowerCase())}`);
}
