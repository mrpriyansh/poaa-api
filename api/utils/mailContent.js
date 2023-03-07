/* eslint-disable guard-for-in */
const { formatDateReverse } = require('.');

const mailContent = (accounts, name, duration) => {
  let accountsInfo = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const index in accounts) {
    accountsInfo += `<tr  style="background-color: ${index % 2 ? '#fff' : '#74bedb'};">
                            <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${
                              accounts[index].name
                            }</td>
                            <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${
                              accounts[index].accountNo
                            }</td>
                            <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${
                              accounts[index].accountType
                            }</td>
                            <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${
                              accounts[index].amount
                            }</td>
                            <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${formatDateReverse(
                              accounts[index].maturityDate
                            )}</td>
                        </tr>`;
  }
  return `<body>
  <div style="">
  <h3 style="color: black; display: flex; text-decoration: underline; justify-content: center;min-width: 100%"> Hello ${name}, Following are some account that will mature ${duration}. </h3>
  <br/>
  <table style="border-collapse: collapse;width:90%; margin: auto ">
      <thead>
          <tr style="background-color: #2328c5;">
              <th style="color: #fff;border: 1px solid #dddddd;">Name</th>
              <th style="color: #fff;border: 1px solid #dddddd;">Account Number</th>
              <th style="color: #fff;border: 1px solid #dddddd;">Account Type</th>
              <th style="color: #fff;border: 1px solid #dddddd;">Amount</th>
              <th style="color: #fff;border: 1px solid #dddddd;">Maturity Date</th>
          </tr>
      </thead>
      <tbody>
      ${accountsInfo}
      </tbody>
  </table>
  <p style="color:#756f73";> ThankYou <br /> Regards POAA </p>
</div>
</body>
`;
};

module.exports = mailContent;
