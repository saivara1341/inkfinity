import { supabase } from "@/integrations/supabase/client";

export class CanvaService {
  private static clientId = import.meta.env.VITE_CANVA_CLIENT_ID || "AUZIYQD6zicO8mI6Vf2z5_N_RzE="; // Example from docs
  private static redirectUri = `${window.location.origin}/inkfinity/canva-auth`;

  /**
   * Generates the Canva OAuth 2.0 authorization URL.
   */
  static getAuthUrl(): string {
    const scopes = [
      "design:read",
      "design:content:read",
      "asset:read",
      "asset:write",
      "design:export:read",
      "design:export:write"
    ].join(" ");

    const url = new URL("https://www.canva.com/api/oauth/authorize");
    url.searchParams.append("client_id", this.clientId);
    url.searchParams.append("redirect_uri", this.redirectUri);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("scope", scopes);
    url.searchParams.append("code_challenge_method", "S256");
    // In a real app, generate and save the code_verifier, then generate the challenge
    // For now, we'll use a simplified version for demonstration
    url.searchParams.append("code_challenge", "E9Melzh26nF9ScS4Pn4uUmWR6agmFbXla2S4_CUfHfuG"); 

    return url.toString();
  }

  /**
   * Exchanges the authorization code for access tokens via a secure Edge Function.
   */
  static async exchangeCodeForToken(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke("canva-token-exchange", {
        body: { code, redirectUri: this.redirectUri }
      });

      if (error) throw new Error(error.message);
      
      // Store the token securely (ideally in Supabase user metadata)
      console.log("Canva token exchanged successfully!");
      return { success: true };
    } catch (err: any) {
      console.error("Canva Token Exchange Error:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Triggers a design export from Canva.
   */
  static async exportDesign(designId: string): Promise<{ url: string; error?: string }> {
     try {
       console.log("Triggering Canva Design Export...", { designId });
       
       const { data, error } = await supabase.functions.invoke("canva-api-proxy", {
         body: {
           endpoint: `/designs/${designId}/exports`,
           method: "POST",
           payload: {
             format: "png",
             quality: "high"
           }
         }
       });

       if (error) throw new Error(error.message);
       return { url: data.exportUrl };
     } catch (err: any) {
       console.error("Canva Export Error:", err);
       return { url: "", error: err.message };
     }
  }
}
