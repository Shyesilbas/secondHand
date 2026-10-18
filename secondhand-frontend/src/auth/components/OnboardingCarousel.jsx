import React from 'react';
import {
 CheckCircle as CheckCircleIcon,
 ChevronLeft as ChevronLeftIcon,
 ChevronRight as ChevronRightIcon,
 MessageCircle as MessageCircleIcon,
 PlusCircle as PlusCircleIcon,
 ShieldCheck as ShieldCheckIcon,
 Tag as TagIcon,
 Truck as TruckIcon,
} from 'lucide-react';

const CARDS = [
 {
 title: 'Publish Listings',
 description: 'Create and manage your product listings with ease.\nReach thousands of potential buyers instantly.',
 Icon: PlusCircleIcon,
 iconBg: 'bg-background-tertiary',
 iconColor: 'text-text-secondary',
 },
 {
 title: 'Make an Offer',
 description: 'Negotiate prices directly on any listing.\nGet the best deal without leaving the app.',
 Icon: TagIcon,
 iconBg: 'bg-background-tertiary',
 iconColor: 'text-text-primary',
 },
 {
 title: 'Chat with Sellers',
 description: 'Ask questions and confirm details before you buy.\nDirect messaging keeps everything in one place.',
 Icon: MessageCircleIcon,
 iconBg: 'bg-background-tertiary',
 iconColor: 'text-text-secondary',
 },
 {
 title: 'Track Your Order',
 description: 'Follow every step of your purchase in real time.\nFrom payment to delivery — always in the loop.',
 Icon: TruckIcon,
 iconBg: 'bg-background-tertiary',
 iconColor: 'text-text-primary',
 },
 {
 title: 'Secure Payments',
 description: 'Escrow-backed transactions protect every deal.\nYour money is safe until delivery is confirmed.',
 Icon: ShieldCheckIcon,
 iconBg: 'bg-background-tertiary',
 iconColor: 'text-text-primary',
 },
 {
 title: 'Verified Accounts',
 description: 'Trade with confidence on a trusted marketplace.\nAll sellers go through our verification process.',
 Icon: CheckCircleIcon,
 iconBg: 'bg-background-tertiary',
 iconColor: 'text-text-secondary',
 },
];

export const OnboardingCarousel = () => {
 const [index, setIndex] = React.useState(0);
 const total = CARDS.length;

 React.useEffect(() => {
 const id = window.setInterval(() => {
 setIndex((prev) => (prev + 1) % total);
 }, 5000); // Slower, calmer transition
 return () => window.clearInterval(id);
 }, [total]);

 const prev = () => setIndex((i) => (i - 1 + total) % total);
 const next = () => setIndex((i) => (i + 1) % total);

 const card = CARDS[index];
 const CardIcon = card.Icon;

 return (
 <div className="h-full w-full flex flex-col items-center justify-center px-8 py-12 select-none">
 <div className="flex flex-col items-center text-center w-full max-w-sm gap-8">
 {/* Visual Accent Container */}
 <div className="relative flex items-center justify-center p-8 bg-background-primary rounded-md border border-border/40 transition-all duration-500">
 <CardIcon className={`w-14 h-14 ${card.iconColor} stroke-1.5`} />
 </div>

 <div className="space-y-3.5">
 <h2 className="text-lg font-semibold text-text-primary tracking-tight transition-all duration-500">
 {card.title}
 </h2>
 <p className="text-xs text-text-tertiary leading-relaxed whitespace-pre-line max-w-72 mx-auto transition-all duration-500">
 {card.description}
 </p>
 </div>

 <div className="flex items-center gap-6 mt-4">
 <button
 type="button"
 onClick={prev}
 className="w-8 h-8 rounded border border-border bg-background-primary flex items-center justify-center text-text-muted hover:text-text-primary transition-all shadow-sm"
 >
 <ChevronLeftIcon className="w-4 h-4" />
 </button>

 <div className="flex gap-1.5 items-center">
 {CARDS.map((_, i) => (
 <button
 key={i}
 type="button"
 onClick={() => setIndex(i)}
 className={`rounded-full transition-all duration-300 ${
 i === index
 ? 'w-5 h-1 bg-primary'
 : 'w-1 h-1 bg-secondary-300 hover:bg-secondary-400'
 }`}
 />
 ))}
 </div>

 <button
 type="button"
 onClick={next}
 className="w-8 h-8 rounded border border-border bg-background-primary flex items-center justify-center text-text-muted hover:text-text-primary transition-all shadow-sm"
 >
 <ChevronRightIcon className="w-4 h-4" />
 </button>
 </div>
 </div>

 <div className="absolute bottom-8 right-10 text-xs text-text-muted font-semibold">
 {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
 </div>
 </div>
 );
};
