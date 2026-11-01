import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Not found</h1>
      <p>This task doesn&apos;t exist or was deleted.</p>
      <Link href="/">Back to the list</Link>
    </>
  );
}
