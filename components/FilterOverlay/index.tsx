import { X } from "lucide-react";
interface FilterOverlayProps {
    setFilterPopUp: React.Dispatch<React.SetStateAction<boolean>>;
    filterPopUp: boolean;
}

export default function FilterOverlay({
    setFilterPopUp,
    filterPopUp,
}: FilterOverlayProps) {
    return (
        <div className="fixed inset-0 top-[88px] h-fit lg:absolute lg:left-[-250px] lg:top-[70px] lg:w-[30px] lg:min-w-[300px] bg-white lg:border lg:border-gray-300 rounded-lg shadow-lg p-4 whitespace-nowrap overflow-hidden text-ellipsis z-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <div
                    className="flex space-x-2"
                    onClick={() => setFilterPopUp(!filterPopUp)}
                >
                    <X size={20} className=" cursor-pointer" />
                </div>
            </div>
            <p className="text-stone-400 mb-4">No filters</p>
        </div>
    );
}
