import { redirect } from "next/navigation";

export default function CheckoutLegacyRedirect() {
    redirect("/iot-system/payment-gateway");
}
