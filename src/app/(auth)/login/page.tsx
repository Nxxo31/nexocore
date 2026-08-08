// NexoCore — Login page

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            NexoCore
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            ERP/CRM/Analytics para tu negocio
          </p>
        </div>

        <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="admin@tunegocio.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700"
          >
            Iniciar sesión
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                o
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-slate-700 font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            Continuar con Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
