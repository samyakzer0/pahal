import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LucideIcon, ArrowRight } from 'lucide-react'
import { cn } from '../lib/utils'

interface Step {
    icon: LucideIcon
    title: string
    description: string
}

interface StepsCarouselProps {
    steps: Step[]
    className?: string
}

export default function StepsCarousel({ steps, className }: StepsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % steps.length)
        }, 4000)

        return () => clearInterval(timer)
    }, [steps.length])

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    }

    const swipeConfidenceThreshold = 10000
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity
    }

    const paginate = (newDirection: number) => {
        setDirection(newDirection)
        setCurrentIndex((prev) => (prev + newDirection + steps.length) % steps.length)
    }

    const CurrentIcon = steps[currentIndex].icon

    return (
        <div className={cn("relative w-full max-w-xl mx-auto overflow-hidden px-4 py-8", className)}>
            <div className="relative h-[300px] w-full">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x)

                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1)
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1)
                            }
                        }}
                        className="absolute w-full h-full"
                    >
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl h-full flex flex-col items-center text-center justify-center relative overflow-hidden group">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110 duration-500" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50 rounded-tr-full -ml-8 -mb-8 opacity-50 transition-transform group-hover:scale-110 duration-500" />

                            <div className="absolute top-6 right-8 z-0">
                                <span className="text-8xl font-bold text-blue-600 select-none font-mono">
                                    0{currentIndex + 1}
                                </span>
                            </div>

                            <div className="relative z-10 mb-6">
                                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-500 transition-colors duration-300 shadow-sm">
                                    <CurrentIcon className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">
                                {steps[currentIndex].title}
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed relative z-10">
                                {steps[currentIndex].description}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Indicators */}
            <div className="flex justify-center gap-3 mt-8">
                {steps.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setDirection(index > currentIndex ? 1 : -1)
                            setCurrentIndex(index)
                        }}
                        className={cn(
                            "w-3 h-3 rounded-full transition-all duration-300",
                            index === currentIndex
                                ? "bg-blue-600 w-8"
                                : "bg-gray-300 hover:bg-gray-400"
                        )}
                        aria-label={`Go to step ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
