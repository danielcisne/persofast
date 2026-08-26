import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { PerfilUsuario } from '../types';

interface AuthContextType {
  usuario: User | null;          
  perfil: PerfilUsuario | null;  
  cargando: boolean;            
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      
      if (user) {
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
      {!cargando && children} 
    </AuthContext.Provider>
  );
}

  export const useAuth = () => useContext(AuthContext);
