import logo from "../../assets/logo/logo2.png";

export const getHeader = () => `
   <!-- HEADER -->
        <div style="
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          padding:12px 15px;
          background:#f4d7b5;
        ">
          <!-- Logo -->
          <img src="${logo}" style="height:120px; margin-bottom:10px;" alt="Logo"/>
          
          <!-- Text -->
          <div>
            <div style="font-size:28px; font-weight:bold; color:#4e342e;">
              UTPALA AYURDHAMA
            </div>
            <div style="font-size:18px; color:#333; margin-top:4px; line-height:1.6;">
              New BEL Rd, Chikkamaranahalli, Dollars Colony,
              R.M.V. 2nd Stage, Bengaluru, Karnataka 560094
            </div>
          </div>
        </div>
`;