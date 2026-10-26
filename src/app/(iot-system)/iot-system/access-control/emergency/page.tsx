import { AccessConsoleFrame } from "@/modules/iot-system/access-control";

export default function AccessEmergencyPage() {
    return <AccessConsoleFrame initialTab="tab-command" emergencyTrigger={true} />;
}