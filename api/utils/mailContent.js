const mailContent = (accounts, name) => {
  //   const accountDetails = accounts.map((account, index) => {
  //     return index + 1
  //       ? `<tr  style="background-color: #74bedb;">
  //                 <td style="text-align: center; padding: 25px">${account.name}</td>
  //                 <td style="text-align: center; padding: 25px">${account.accountNo}</td>
  //                 <td style="text-align: center; padding: 25px">${account.accountType}</td>
  //                 <td style="text-align: center; padding: 25px">${account.amount}</td>
  //             </tr>`
  //       : `<tr  style="background-color: #fff;">
  //             <td style="text-align: center;">${account.name}</td>
  //             <td style="text-align: center;">${account.accountNo}</td>
  //             <td style="text-align: center;">${account.accountType}</td>
  //             <td style="text-align: center;">${account.amount}</td>
  //     </tr>`;
  //   });
  //   let accountsInfo = '';
  //   for (det in accountDetails) {
  //     accountsInfo += accountDetails[det];
  //   }
  let accountsInfo = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const index in accounts) {
    if (index % 2 === 0) {
      accountsInfo += `<tr  style="background-color: #fff;">
                            <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${accounts[index].name}</td>
                            <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${accounts[index].accountNo}</td>
                            <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${accounts[index].accountType}</td>
                            <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${accounts[index].amount}</td>
                        </tr>`;
    } else {
      accountsInfo += `<tr  style="background-color: #74bedb;">
                          <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${accounts[index].name}</td>
                          <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${accounts[index].accountNo}</td>
                          <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${accounts[index].accountType}</td>
                          <td style="text-align: center; color:#000; border: 1px solid #dddddd; padding: 0 25px">${accounts[index].amount}</td>
                      </tr>`;
    }
  }
  return `<body>
  <div style="">
  <h3 style="color: black; display: flex; text-decoration: underline; justify-content: center;min-width: 100%"> Hello ${name}, Following are some account that will mature today. </h3>
  <br/>
  <table style="border-collapse: collapse;width:90%; margin: auto ">
      <thead>
          <tr style="background-color: #2328c5;">
              <th style="color: #fff;border: 1px solid #dddddd;">Name</th>
              <th style="color: #fff;border: 1px solid #dddddd;">Account Number</th>
              <th style="color: #fff;border: 1px solid #dddddd;">Account Type</th>
              <th style="color: #fff;border: 1px solid #dddddd;">Amount</th>
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
