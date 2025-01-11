import { FaTwitter } from 'react-icons/fa'; // Correct import

export default function Header() {
  return (
    <header className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Prateek Dixit
          </h1>
          <div className="flex gap-4 text-gray-600">
            <span className="font-medium">Founder</span>
            <span className="font-normal">Writer</span>
            <span className="font-normal">Painter</span>
          </div>
        </div>
        <a 
          href="https://twitter.com/username" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-gray-900 transition-colors"
        >
          < FaTwitter />
        </a>
      </div>
    </header>
  );
}