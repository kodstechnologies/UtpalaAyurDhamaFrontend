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
          width:100%;
          border-radius:3px;
          box-sizing:border-box;
        ">
          <!-- Logo -->
          <img src="${logo}" style="height:120px;" alt="Logo"/>
          

          <!-- Address -->
          <div style="font-size:14px; color:#000; line-height:1.6;">
            New BEL Road, Chikkamaranahalli, Dollars Colony,
            R.M.V. 2nd Stage, Bengaluru, Karnataka 560094
          </div>
        </div>
`;