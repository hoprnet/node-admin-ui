type FaqElement = {
  id: number;
  title: string;
  content: string | JSX.Element;
};

type FaqData = Record<string, FaqElement[]>;

const nodeFaq: FaqData = {
  '/node/info': [
    {
      id: 1,
      title: 'What version of HOPRd should I be running?',
      content: (
        <span>
          You can find the latest version for your device on our docs:
          <br />
          <br />- For{' '}
          <a
            href="https://docs.hoprnet.org/node/using-dappnode"
            target="_blank"
            rel="noreferrer"
          >
            Dappnode
          </a>
          <br />
          <br />- For{' '}
          <a
            href="https://docs.hoprnet.org/node/using-docker"
            target="_blank"
            rel="noreferrer"
          >
            Docker
          </a>
        </span>
      ),
    },
    {
      id: 2,
      title: 'What is an environment?',
      content:
        'Environments contain a set of releases which are compatible. For example, the monte_rosa environment is what all releases between v1.00 and v1.99.00 run in, and within this environment, all nodes running one of these releases can interact with each other.',
    },
    {
      id: 4,
      title: 'How is node health calculated?',
      content: 'It is calculated using the network`s heartbeat mechanism.',
    },
    {
      id: 5,
      title: 'How many tokens should I have on my node?',
      content:
        '0.2 xDAI is plenty to run your node. wxHOPR can be ad-hoc requested from your safe as long as there is a sufficient remaining allowance on your safe, so there is no need to store funds on your node.',
    },
    {
      id: 6,
      title: 'Why do I need to know token/smart contract addresses?',
      content: 'This is important to verify the authenticity of the contracts.',
    },
    {
      id: 7,
      title: 'What are channels and why do I need them?',
      content:
        'Payment channels are funded connections between two nodes. Without a payment channel open to node X, you cannot use node X to relay data. You want to have a set of well-funded, well-connected channels to and from your node, so it is used for relays and you earn more tickets/wxHOPR.',
    },
  ],
  '/node/logs': [
    {
      id: 1,
      title: 'What are these logs for?',
      content:
        'Here you can see the running logs of your node. These are great for real-time information on your node and diagnostic information.',
    },
  ],
  '/node/tickets': [
    {
      id: 1,
      title: 'What are tickets?',
      content:
        'You earn tickets for relaying data. Each ticket may or may not contain wxHOPR, by using probabilistic payment and aggregating tickets when you redeem them on-chain, it reduces the on-chain transaction fees and exposes less metadata on-chain in comparison to paying directly in wxHOPR.',
    },
    {
      id: 2,
      title: 'What are unredeemed tickets?',
      content: 'The tickets earned by your node that have yet to be redeemed.',
    },
    {
      id: 3,
      title: 'When should my node redeem tickets?',
      content: (
        <span>
          Tickets are automatically redeemed. If you`ve set a custom aggregation threshold, tickets are aggregated
          accordingly before redemption; otherwise, it defaults to aggregating 100 tickets per channel. Please check the
          incoming channels page for the number of unredeemed tickets per channel.
          <br />
          <br />
          <b>IMPORTANT:</b> If the unredeemed ticket value per channel exceeds your custom aggregation threshold or the
          default aggregation value of 100, there may be an issue with your node. Please report this on the{' '}
          <a
            href="https://t.me/hoprnet"
            target="_blank"
            rel="noreferrer"
          >
            HOPR Telegram channel
          </a>{' '}
          or{' '}
          <a
            href="https://discord.gg/dEAWC4G"
            target="_blank"
            rel="noreferrer"
          >
            Discord server
          </a>
          .
        </span>
      ),
    },
    {
      id: 4,
      title: 'Why do I have rejected tickets?',
      content: (
        <span>
          These are tickets that failed network validation and were deemed suspicious. This issue likely happens when
          your node didn`t sync properly. Please make sure you are using our recommended RPC providers{' '}
          <a
            href="https://docs.hoprnet.org/node/start-here#understanding-rpc-importance-and-setting-up-your-own-custom-rpc-provider"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </span>
      ),
    },
    {
      id: 5,
      title: 'How do I redeem neglected tickets?',
      content: (
        <span>
          Neglected tickets cannot be redeemed. This may occur when closing a payment channel with your node, if your
          strategy`s <b>on_close_redeem_single_tickets_value_min</b> value was higher than your ticket value on the
          closing channel.
        </span>
      ),
    },
    // {
    //   id: 3,
    //   title: 'When should I redeem my tickets?',
    //   content:
    //     'Ticket redemption costs a small fee in xDAI to complete the on-chain transaction. To lower this cost, the HOPR protocol batches ticket redemption, so it is generally more efficient to redeem multiple tickets at once. For maximum margins, only redeem tickets when you would otherwise lose them due to channel closure.',
    // },
    {
      id: 6,
      title: 'How is ticket value calculated?',
      content: 'Ticket value is the total wxHOPR earned from all your winning tickets redeemed.',
    },
  ],
  '/node/metrics': [
    {
      id: 1,
      title: 'What is a PRN?',
      content:
        'A Public Relay Node (PRN) is an intermediary node used by other nodes on the network to communicate. As most nodes are behind NAT, it is difficult at times to send information directly to the IP address of the node.',
    },
    {
      id: 2,
      title: 'Why are my connection attempts failing?',
      content: (
        <span>
          If a large proportion of your connection attempts are failing, there is likely an issue with your node or a
          bug. This is diagnostic information you can pass on for support to one of our ambassadors on Telegram:{' '}
          <a
            href="https://t.me/hoprnet"
            target="_blank"
            rel="noreferrer"
          >
            https://t.me/hoprnet
          </a>
        </span>
      ),
    },
    {
      id: 3,
      title: 'What is STUN?',
      content:
        'Stun is a protocol which helps in dealing with nodes behind Network Address Translation (NAT), which is most nodes on the network.',
    },
    {
      id: 4,
      title: 'What is TCP/UDP?',
      content:
        'These are two transport protocols for sending data across networks. We mainly use TCP, although at times, it is better to use UDP for certain NAT nodes.',
    },
    {
      id: 5,
      title: 'What is an exposed host?',
      content:
        'You can expose your node through port forwarding or other methods, which make your node easier to access. This allows it to be accessed directly without the need for a PRN.',
    },
    {
      id: 6,
      title: 'What are node strategies?',
      content:
        'Node strategies are automatic node management settings you can apply to your node. This means you will not have to manually open/close channels or allocate funds, but your node will automatically do this to keep your node well-connected.',
    },
    {
      id: 7,
      title: 'What is a tick?',
      content:
        'If you have set an active node strategy, every so often your node will check the topology of the network and the health of your connections and use this information to make decisions which are in line with your strategy. For example, closing underfunded channels or channels to a node you have a low-quality connection to. The last time your node did this is the last "tick".',
    },
    {
      id: 8,
      title: 'What are channels, and why do I need them?',
      content:
        'Payment channels are funded connections between two nodes. Without a payment channel open to node X, you cannot use node X to relay data. You want to have a set of well-funded and well-connected channels to and from your node, so it is used for more relays.',
    },
    {
      id: 9,
      title: 'What is a heap?',
      content: 'A heap is a specific way to allocate a set of data so that it is easy to sort and prioritize.',
    },
  ],
  '/node/ping': [
    {
      id: 1,
      title: 'Why should I ping someone?',
      content:
        'A ping is a great way to see if a node is active and available. Send a ping to see if the node you want to communicate with or open a channel to is actually responsive or not.',
    },
  ],
  '/networking/peers': [
    {
      id: 1,
      title: 'Does the number of peers impact my node performance?',
      content:
        'Generally having more visible nodes is better. If nodes on the network are not visible to you, this could be a sign of lower performance or node health. But as long as this number is not zero or very low, you are likely fine.',
    },
  ],
  '/networking/aliases': [
    {
      id: 1,
      title: 'What is an alias?',
      content:
        'An alias is a nickname you set a node so you can keep a reminder of who they are. E.g. Great Node 3, John etc...',
    },
  ],
  '/networking/channels-INCOMING': [
    {
      id: 1,
      title: 'Unredeemed tickets value',
      content:
        'On each incoming channel, you can see the amount of unredeemed ticket value received by that specific node. The count of unredeemed ticket value resets at the each restart of the node.',
    },
    {
      id: 2,
      title: 'Tickets values are different?',
      content:
        'The table of the Incomming Channels shows the value of tickets counted from last reset of your node, and the Tickets subpage shows the ticket number from the last reset of the node databse.',
    },
  ],
  '/networking/channels': [
    {
      id: 1,
      title: 'How much wxHOPR should be in channels?',
      content:
        'A channel with less than 0.05 wxHOPR would be considered underfunded and soon to run out of wxHOPR. If it is actively used this will drain very quickly.',
    },
    {
      id: 2,
      title: 'Different channel statuses',
      content: (
        <span>
          You can view the lifecycle of a payment channel and what the different states mean here:{' '}
          <a
            href="https://docs.hoprnet.org/developers/smart-contract#lifecycle-of-payment-channel"
            target="_blank"
            rel="noreferrer"
          >
            https://docs.hoprnet.org/developers/smart-contract#lifecycle-of-payment-channel
          </a>
        </span>
      ),
    },
  ],
};

export default nodeFaq;
