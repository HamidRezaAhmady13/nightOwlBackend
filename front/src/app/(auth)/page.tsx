import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/feed");

  //    const router= useRouter()
  //    router.forward('/feed')
  //   return <div>home page</div>;
}
