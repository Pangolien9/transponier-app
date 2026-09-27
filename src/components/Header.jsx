export function Header() {
  return (
    <header className="bg-black text-white py-6 px-4 shadow-md">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-0">Transponier-App</h1>
          <div className="text-sm text-gray-300 text-center sm:text-right">
            <p>Instrumente transponieren und extrahieren</p>
            <p className="text-xs mt-1">100% client-seitig</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header