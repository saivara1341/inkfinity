import React from 'react';

export const handleFormKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
  if (['Enter', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
    const target = e.target as HTMLElement;
    
    // Only capture keys if the user is currently focused on an input or textarea
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      return;
    }
    
    const container = e.currentTarget;
    // Find all focusable inputs, textareas, and buttons within the form container
    const focusableElements = Array.from(
      container.querySelectorAll('input:not([disabled]), textarea:not([disabled]), button:not([disabled])')
    ) as HTMLElement[];
    
    const index = focusableElements.indexOf(target);
    if (index > -1) {
      let nextIndex = index;
      
      if (e.key === 'ArrowUp') {
        nextIndex = index - 1;
        e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
        nextIndex = index + 1;
        e.preventDefault(); // Prevent default Enter submission and scroll
      }
      
      // Focus the next available element
      if (nextIndex >= 0 && nextIndex < focusableElements.length) {
        focusableElements[nextIndex].focus();
      }
    }
  }
};
