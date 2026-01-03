// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import { usePathname } from "next/navigation";

// export default function PageTransition({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     const pathName = usePathname();

//     return (
//         <AnimatePresence mode="popLayout">
//             <motion.div
//                 key={pathName}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.5 }}
//             >
//                 {children}
//             </motion.div>
//         </AnimatePresence>
//     );
// }

"use client";

export default function PageTransition({
    children,
}: {
    children: React.ReactNode;
}) {
    // Simply render children instantly without any animation overhead
    return <>{children}</>;
}
