'use client'
import { createContext, useContext } from 'react'
export type VisualEditing = { enabled: boolean; selected: string | null; select: (id:string)=>void; change:(id:string,value:string)=>void }
export const VisualEditingContext = createContext<VisualEditing | null>(null)
export function useVisualEditing() { return useContext(VisualEditingContext) }
