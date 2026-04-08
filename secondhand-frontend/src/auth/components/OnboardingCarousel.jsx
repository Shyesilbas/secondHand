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
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-500',
    },
    {
        title: 'Make an Offer',
        description: 'Negotiate prices directly on any listing.\nGet the best deal without leaving the app.',
        Icon: TagIcon,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-500',
    },
    {
        title: 'Chat with Sellers',
        description: 'Ask questions and confirm details before you buy.\nDirect messaging keeps everything in one place.',
        Icon: MessageCircleIcon,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-500',
    },
    {
        title: 'Track Your Order',
        description: 'Follow every step of your purchase in real time.\nFrom payment to delivery — always in the loop.',
        Icon: TruckIcon,
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-500',
    },
    {
        title: 'Secure Payments',
        description: 'Escrow-backed transactions protect every deal.\nYour money is safe until delivery is confirmed.',
        Icon: ShieldCheckIcon,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-500',
    },
    {
        title: 'Verified Accounts',
        description: 'Trade with confidence on a trusted marketplace.\nAll sellers go through our verification process.',
        Icon: CheckCircleIcon,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-500',
    },
];

export const OnboardingCarousel = () => {
    const [index, setIndex] = React.useState(0);
    const total = CARDS.length;

    React.useEffect(() => {
        const id = window.setInterval(() => {
            setIndex((prev) => (prev + 1) % total);
        }, 3000);
        return () => window.clearInterval(id);
    }, [total]);

    const prev = () => setIndex((i) => (i - 1 + total) % total);
    const next = () => setIndex((i) => (i + 1) % total);

    const card = CARDS[index];
    const CardIcon = card.Icon;

    return (
        <div className="h-full w-full flex flex-col items-center justify-center px-12 py-16 select-none">
            <div className="flex flex-col items-center text-center w-full max-w-sm gap-6">
                <div className={`w-24 h-24 rounded-3xl ${card.iconBg} flex items-center justify-center shadow-sm transition-all duration-500`}>
                    <CardIcon className={`w-12 h-12 ${card.iconColor} transition-all duration-500`} strokeWidth={1.5} />
                </div>

                <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-secondary-900 tracking-tight transition-all duration-500">
                        {card.title}
                    </h2>
                    <p className="text-sm text-secondary-500 leading-relaxed whitespace-pre-line transition-all duration-500">
                        {card.description}
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <button
                        type="button"
                        onClick={prev}
                        className="w-9 h-9 rounded-full border border-secondary-200 bg-white flex items-center justify-center text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 transition-colors shadow-sm"
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
                                        ? 'w-6 h-2 bg-secondary-900'
                                        : 'w-2 h-2 bg-secondary-300 hover:bg-secondary-400'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={next}
                        className="w-9 h-9 rounded-full border border-secondary-200 bg-white flex items-center justify-center text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 transition-colors shadow-sm"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="absolute bottom-6 right-8 text-xs text-secondary-400 font-medium">
                {index + 1} / {total}
            </div>
        </div>
    );
};
