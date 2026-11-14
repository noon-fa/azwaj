import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<main className="text-taupe-200">
			<h1>Azwaj</h1>
		</main>
	);
}
