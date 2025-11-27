"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyTypeOption {
  id: string;
  label: string;
  value: string;
}

interface CompanyTypeDropdownProps {
  options: CompanyTypeOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CompanyTypeDropdown({
  options,
  value,
  onValueChange,
  placeholder = "Select company type",
  className,
}: CompanyTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    // Use a small delay to ensure the dropdown is rendered before attaching the listener
    // Use capture: false so button clicks register first
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, false);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, false);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (option: CompanyTypeOption) => {
    onValueChange?.(option.value);
    setIsOpen(false);
  };

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && mounted && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
          }}
          className={cn(
            "z-[100] rounded-lg border-2 overflow-hidden shadow-2xl pointer-events-auto",
            "bg-background border-foreground"
          )}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(option);
              }}
              className={cn(
                "w-full px-4 py-3 text-left transition-colors duration-200 cursor-pointer",
                "hover:bg-foreground hover:text-background",
                "flex items-center justify-between group",
                value === option.value && "bg-foreground/10",
                index !== options.length - 1 && "border-b border-border"
              )}
            >
              <span className="font-medium">{option.label}</span>
              {value === option.value && (
                <Check className="w-4 h-4" />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className={cn("relative", className)}>
        {/* Dropdown Button */}
        <motion.button
          ref={buttonRef}
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-4 py-2 rounded-lg border-2 transition-all duration-300",
            "bg-background border-foreground text-foreground",
            "hover:bg-foreground hover:text-background",
            "flex items-center justify-between group"
          )}
        >
          <span className="font-medium">{displayText}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>
      {mounted && createPortal(dropdownContent, document.body)}
    </>
  );
}

