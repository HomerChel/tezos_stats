export function shortenTezosWalletAddress(walletAddress: string){
  if (!walletAddress) return

  if (walletAddress.length < 9) return walletAddress

  const header = walletAddress.substr(0, 3) // Kt1
  const footer = walletAddress.substr(walletAddress.length - 5, walletAddress.length) //  AaD
  return header + '...' + footer
}