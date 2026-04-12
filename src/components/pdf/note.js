import { getFooter } from "./pdfFooter";

export const getNote = () => `
  <!-- NOTES SECTION -->
  <div class="notes-section" style="font-family: Arial, sans-serif; font-size:14px; color:#333; padding: 10px; 0">
    
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      
      <!-- Left Side (Notes) -->
      <div style="width:70%;">
        <div style="font-weight:bold; margin-bottom:8px;">Notes:</div>
        
        <div>• Ensure you verify the invoice before leaving.</div>
        <div>• For any questions or concerns, please contact or email us.</div>
        <div>• Thank you for your continued trust and support!</div>
        <div>• We greatly appreciate your visit. You're a valued customer at <b>UTPALA AYURDHAMA</b>.</div>
        <div>
          • To know more about our services, visit:
          <a href="https://utpalaayurdhama.com" target="_blank" style="color:#007bff; text-decoration:none;">
            utpalaayurdhama.com
          </a>
        </div>

        <div style="margin-top:10px; font-weight:bold;">
          Please visit us again...!
        </div>
      </div>

      <!-- Right Side (Signature) -->
      <div style="width:25%; text-align:right;">
        <div style="margin-bottom:50px; font-weight:bold;">
          For UTPALA AYURDHAMA
        </div>
        <div>Authorized Signature</div>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align:center; margin-top:15px; font-size:13px; color:#666;">
      This is a system-generated invoice. You can use the invoice number to track it in the future.
    </div>

  </div>
  ${getFooter()}
`;