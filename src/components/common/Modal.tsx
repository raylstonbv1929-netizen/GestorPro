import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
    className?: string; // Classes for the modal container itself
    containerClassName?: string; // Classes for the outer fixed wrapper
    blurIntensity?: 'md' | 'xl' | '2xl';
    backdropOpacity?: string;
}

/**
 * Global Modal Component - Protocolo de Foco Absoluto
 * Implementa React Portals, Body Scroll Lock e Backdrop Blur de alta intensidade.
 */
export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    maxWidth = 'max-w-4xl',
    className = '',
    containerClassName = '',
    blurIntensity = '2xl',
    backdropOpacity = 'bg-slate-950/95'
}) => {
    // Bloqueio de Scroll do Body (UX Sentinel)
    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    // Atalho ESC para fechar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const blurClasses = {
        md: 'backdrop-blur-md',
        xl: 'backdrop-blur-xl',
        '2xl': 'backdrop-blur-2xl'
    };

    return createPortal(
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 ${containerClassName}`}>
            {/* Backdrop de Isolamento Sensorial */}
            <div 
                className={`absolute inset-0 ${backdropOpacity} ${blurClasses[blurIntensity]} animate-fade-in cursor-default`} 
                onClick={onClose} 
            />
            
            {/* Modal Content Wrapper */}
            <div className={`relative z-10 w-full ${maxWidth} ${className} animate-fade-in transition-all duration-500`}>
                {children}
            </div>
        </div>,
        document.body
    );
};
