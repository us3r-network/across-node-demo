// import { encodeAbiParameters } from 'viem';
import { encodeAbiParameters, createPublicClient, http, createWalletClient, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ABI } from './spoke-abi';
import { baseSepolia } from 'viem/chains';
import { writeContract } from 'viem/actions';

export const account = privateKeyToAccount('xxx')

async function main() {
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(), // Replace with your provider's URL
    });

    const walletClient = createWalletClient({
        chain: baseSepolia,
        account,
        transport: http(), // Replace with your provider's URL
    });

    const buyer = '0xc6f66f5A51EF56A1D511210686769bcc7204Cc3D';
    const referral = buyer;
    const tokenAddress = '0x06f3bca924eAeBd14804F750021CeB771c0998a6';
    const inputToken = '0x4200000000000000000000000000000000000006';
    const outputToken = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
    const originChainId = 84532;
    const destinationChainId = 11155111;
    const amount = parseEther('0.1');


    const resp = await fetch(`https://testnet.across.to/api/suggested-fees?inputToken=${inputToken}&outputToken=${outputToken}&originChainId=${originChainId}&destinationChainId=${destinationChainId}&amount=${amount.toString()}`);
    const data = await resp.json();

    const fee = data.lpFee.total;
    const timestamp = Number(data.timestamp);

    // console.log(data)

    const tx = await walletClient.writeContract({
        chain: baseSepolia,
        address: '0x82B564983aE7274c86695917BBf8C99ECb6F0F8F', // base-sepolia spoke-poll contract address
        abi: ABI,
        functionName: 'depositV3',
        args: [
            buyer,
            '0x7060c02DDAFb23810bB3b3DcF8B7c2434232B2F1', // pgfFactory address
            inputToken, // base weth address
            outputToken, // ethereum weth address
            amount,
            amount - BigInt(fee),
            11155111,  // destinationChainId
            '0x0000000000000000000000000000000000000000',
            timestamp,
            timestamp + 32400,
            0,
            encodeAbiParameters(
                [
                    { name: 'buyer', type: 'address' },
                    { name: 'token', type: 'address' },
                    { name: 'min', type: 'uint256' },
                    { name: 'referral', type: 'address' },
                ],
                [buyer, tokenAddress, BigInt(0), referral]),
        ],
        account,
        value: amount,
    })
    console.log(tx)
}

main().catch(console.error);