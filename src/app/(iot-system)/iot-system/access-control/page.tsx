export default function AccessControlRootPage() {
    return (
        <div className="w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0c1017]">
            <iframe
                src="/iot-system/access-control/index.html"
                title="ACCESS Professional - Enterprise Door Control Management"
                className="w-full h-full flex-1 border-0"
                style={{ width: "100%", height: "100%", minHeight: "100%", border: "none" }}
            />
        </div>
    );
}