// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { PerfilUsuario } from '../types';

// Definimos qué información va a transmitir nuestra radio
interface AuthContextType {
  usuario: User | null;          // Los datos básicos (email, contraseña)
  perfil: PerfilUsuario | null;  // Los datos de tu negocio (Rol, Empresa)
  cargando: boolean;             // Para saber si Firebase sigue buscando
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // onAuthStateChanged es el vigilante de Firebase. Nos avisa si alguien entra o sale.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      
      if (user) {
        // Si hay un usuario, vamos a buscar su Rol secreto a la base de datos
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPerfil(docSnap.data() as PerfilUsuario);
        } else {
          setPerfil(null);
        }
      } else {
        setPerfil(null);
      }
      
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, perfil, cargando }}>
      {/* Solo pintamos la app cuando Firebase ya nos respondió */}
      {!cargando && children} 
    </AuthContext.Provider>
  );
}

// Herramienta rápida para que cualquier pantalla pueda escuchar la radio
export const useAuth = () => useContext(AuthContext);