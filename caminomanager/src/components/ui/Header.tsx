import Link from "next/link";

interface HeaderProps {
  userEmail?: string;
  title?: string;
}

export default function Header({ userEmail, title }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b h-16 flex items-center px-4 justify-between">
      <div className="font-semibold text-xl text-gray-900">
        {title ? title : null}
      </div>
      <div className="flex items-center space-x-4">
        {userEmail && <span className="text-sm text-gray-600">{userEmail}</span>}
        <form method="POST" action="/auth/signout">
          <button
            type="submit"
            className="text-sm text-red-600 hover:text-red-800"
          >
            Cerrar Sesión
          </button>
        </form>
      </div>
    </header>
  );
} 