
import "./globals.css";

export const metadata = {
  title: "My Blogs",
  description: "My Thoughts and What’s Running in the Environment",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
         className='flex justify-center'
      >
        {children}
      </body>
    </html>
  );
}
