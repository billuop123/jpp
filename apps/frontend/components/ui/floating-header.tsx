"use client";

import React, { useRef, useEffect } from 'react';
import { BriefcaseIcon, MenuIcon, LogOut, User, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/scripts/lib/utils';
import { useUser } from '@/store/user';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingHeader() {
	const [open, setOpen] = React.useState(false);
	const [dropdownOpen, setDropdownOpen] = React.useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { username, image } = useUser();
	const { data: session } = useSession();
	const router = useRouter();
	const isAuthenticated = !!session;

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setDropdownOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const links = [
		{
			label: 'Features',
			href: '#features',
		},
		{
			label: 'Jobs',
			href: '/jobs',
		},
		{
			label: 'About',
			href: '#about',
		},
	];

	return (
		<motion.header
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className={cn(
				'sticky top-5 z-50',
				'mx-auto w-full max-w-7xl rounded-lg border shadow',
				'bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg',
			)}
		>
			<nav className="mx-auto flex items-center justify-between p-1.5">
				<Link href="/" className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 duration-100">
					<BriefcaseIcon className="size-5" />
					<p className="font-mono text-base font-bold">JobPlace</p>
				</Link>
				<div className="hidden items-center gap-1 lg:flex">
					{links.map((link, index) => (
						<motion.div
							key={link.label}
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Link
								className={buttonVariants({ variant: 'ghost', size: 'sm' })}
								href={link.href}
							>
								{link.label}
							</Link>
						</motion.div>
					))}
				</div>
				<div className="flex items-center gap-2">
					{isAuthenticated ? (
						<>
							{image && (
								<div className="hidden lg:block relative" ref={dropdownRef}>
									<button
										onClick={() => setDropdownOpen(!dropdownOpen)}
										className="relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
									>
										<Image
											src={image}
											alt={username || 'User'}
											width={40}
											height={40}
											className="rounded-full border-2 border-primary cursor-pointer hover:border-primary/80 transition-colors"
										/>
									</button>
									<AnimatePresence>
										{dropdownOpen && (
											<motion.div
												initial={{ opacity: 0, scale: 0.95, y: -10 }}
												animate={{ opacity: 1, scale: 1, y: 0 }}
												exit={{ opacity: 0, scale: 0.95, y: -10 }}
												transition={{ duration: 0.2 }}
												className="absolute right-0 mt-2 w-48 rounded-lg border bg-background shadow-lg py-1 z-50"
											>
												<div className="px-4 py-2 border-b">
													<p className="text-sm font-semibold">{username}</p>
													<p className="text-xs text-muted-foreground truncate">
														{session?.user?.email}
													</p>
												</div>
												<button
													onClick={() => {
														router.push('/user-details');
														setDropdownOpen(false);
													}}
													className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
												>
													<User className="w-4 h-4" />
													Profile
												</button>
												<button
													onClick={() => {
														signOut();
														setDropdownOpen(false);
													}}
													className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-destructive"
												>
													<LogOut className="w-4 h-4" />
													Sign Out
												</button>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							)}

						</>
					) : (
						<>
							<Button 
								size="sm" 
								variant="outline"
								onClick={() => router.push('/api/auth/signin')}
							>
								Sign In
							</Button>
							<Button 
								size="sm"
								onClick={() => router.push('/api/auth/signin')}
							>
								Get Started
							</Button>
						</>
					)}
					<Sheet open={open} onOpenChange={setOpen}>
						<Button
							size="icon"
							variant="outline"
							onClick={() => setOpen(!open)}
							className="lg:hidden"
						>
							<MenuIcon className="size-4" />
						</Button>
						<SheetContent
							className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
							showClose={false}
							side="left"
						>
							<div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
								{links.map((link) => (
									<Link
										key={link.label}
										className={buttonVariants({
											variant: 'ghost',
											className: 'justify-start',
										})}
										href={link.href}
										onClick={() => setOpen(false)}
									>
										{link.label}
									</Link>
								))}
							</div>
							<SheetFooter className="flex-col gap-2">
								{isAuthenticated ? (
									<>
										{image && (
											<div className="flex items-center gap-2 w-full justify-center pb-2">
												<Image
													src={image}
													alt={username || 'User'}
													width={40}
													height={40}
													className="rounded-full border-2 border-primary"
												/>
												<span className="text-sm font-medium">{username}</span>
											</div>
										)}
										<Button 
											variant="outline" 
											className="w-full"
											onClick={() => {
												signOut();
												setOpen(false);
											}}
										>
											Sign Out
										</Button>
										<Button 
											className="w-full"
											onClick={() => {
												router.push('/jobs');
												setOpen(false);
											}}
										>
											Browse Jobs
										</Button>
									</>
								) : (
									<>
										<Button 
											variant="outline" 
											className="w-full"
											onClick={() => {
												router.push('/api/auth/signin');
												setOpen(false);
											}}
										>
											Sign In
										</Button>
										<Button 
											className="w-full"
											onClick={() => {
												router.push('/api/auth/signin');
												setOpen(false);
											}}
										>
											Get Started
										</Button>
									</>
								)}
							</SheetFooter>
						</SheetContent>
					</Sheet>
				</div>
			</nav>
		</motion.header>
	);
}
