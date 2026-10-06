import styled from '@emotion/styled';
import Section from '../future-hopr-lib-components/Section';
import { v } from '../theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 72ch;
  padding: 8px 0 32px;
`;

const BigTitle = styled.h1`
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${v.text};
`;

const Title = styled.h2`
  margin: 16px 0 0;
  font-size: 17px;
  font-weight: 600;
  color: ${v.text};
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: ${v.text2};
  a {
    color: ${v.accentText};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const PrivacyNotice = () => {
  return (
    <Section
      center
      fullHeightMin
      lightBlue
    >
      <StyledContainer>
        <BigTitle>Privacy Notice of HOPR Services Ltd.</BigTitle>
        <br /> <br />
        <Title>I. General Information</Title>
        <Description>
          HOPR Services Ltd., Bleicherweg 33, 8002 Zürich, Switzerland ("we", "us", or "HOPR") is dedicated to improving
          data privacy and reducing reliance on personal data. This Privacy Notice ("Notice") shows what kind of
          personal data we process and in what manner. However, please note that circumstances on how we collect and
          process Your personal data may change, and thus, we may update this Notice from time to time to reflect
          current circumstances. An actual version of this Notice is available on our website at{' '}
          <a
            href="https://hoprnet.org/disclaimer"
            target="_blank"
            rel="noreferrer"
          >
            https://hoprnet.org/disclaimer
          </a>
          .
          <br />
          <br />
          We want to process as little personal information as possible when our customers, business partners and others
          ("You") use our services. We may inform You about further processing of Your data separately, for example, in
          consent forms, terms and conditions, additional privacy notices, forms and other notices. We use the word
          «data» here interchangeably with «personal data».
          <br />
          <br />
          If You provide information to us about any person other than Yourself, Your employees, counterparties,
          business partners, advisors or Your suppliers, You must ensure that the data is accurate, that they understand
          how their information will be used, and that they have given their permission for You to disclose it to us and
          for You to allow us, and our outsourced service providers, to use it.
        </Description>
        <Title>II. Name and Address of the Controller</Title>
        <Description>
          The responsible person for processing Your data under this Privacy Notice («Controller») unless we tell You
          otherwise in an individual case is:
          <br />
          <br />
          HOPR Services Ltd.
          <br />
          Bleicherweg 33
          <br />
          8002 Zürich
          <br />
          e-mail: info@hoprnet.org
        </Description>
        <Title>III. Date Categories</Title>
        <Description>
          Depending on the reason for the processing, we process different data about You. Much of the data set out in
          this Section is provided to us by You (e.g. forms, communication contracts, website, etc.), and You are not
          obliged to disclose data to us. However, if You wish to enter into contracts with us or use our services, You
          must provide us with certain data as part of Your contractual obligation under the relevant contract. When
          using our website, processing technical data cannot be avoided, and when You wish to gain access to certain
          systems or buildings, You must also provide us with registration data.
          <br />
          <br />
          When visiting our website{' '}
          <a
            href="https://rpch.net/"
            target="_blank"
            rel="noreferrer"
          >
            https://rpch.net/
          </a>{' '}
          incl. any subsite, we process:
        </Description>
        <Title>1. Technical Data</Title>
        <Description>
          When You access and visit our website, technical data is collected, for example, Your IP- address, type of
          browser, type of device, access date, time and duration, and websites that You access. Note that Fathom
          Analytics or Vercel never saves your raw IP address and User Agent, and we do not have any access to your IP
          address. Unique visitors are identified via SHA256 hashes to guarantee Your privacy. Technical data is
          recorded in logs with records of the use of our systems. We generally keep technical data for 24 hours.
          Technical data, as such, does not permit drawing conclusions about Your identity.
        </Description>
        <Title>2. Social media buttons/tools</Title>
        <Description>
          We have integrated various social media buttons on our website, allowing You to connect to our social media
          presence on these platforms and get further insights into how our products are set up and work. We may only
          process Your data if You click on these buttons, log in to Your own account on these platforms or register or
          behave otherwise to access it. By clicking on these buttons, You agree that personal data may be collected and
          processed, which may also happen by these social media providers located abroad (e.g. the USA), on their sole
          and own discretion and responsibility. The social media platform may store the data collected about You as
          usage profiles and use them for purposes of advertising, market research and/or demand-oriented design of its
          platform. Such an evaluation is carried out in particular (also for non-logged-in users) to display targeted
          advertising and inform other users of the social media platform about Your activities on our website. Your
          connection to a social media platform, the data transfers between the network and Your system and Your
          interactions on this platform are subject exclusively to the privacy notices of the respective platform. For
          further information on the purpose and scope of data collection and processing by the social media platform,
          please review the privacy notices of these social media platforms. You will also receive further information
          about Your rights and setting options for protecting Your privacy.
        </Description>
        <Title>3. GitHub</Title>
        <Description>
          We have also integrated a GitHub button, which links You directly to this platform. GitHub servers may collect
          and save information/data regarding the pages You view, the referring site, Your IP address and
          information/data about Your device, session information, the date and time of each request, and telemetry data
          (i.e., information about how a specific feature or service is performing) regarding Your use of other
          features, Your interaction with GitHub and functionality of GitHub's service. They use this information/data
          to provide, administer, analyze, manage, and operate their service. We do not collect, store, or process the
          information and/or data collected by GitHub. For more information about the information/data GitHub collects
          and how it uses this information/data, please visit GitHub's privacy policies.
        </Description>
        <Title>4. Communication</Title>
        <Description>
          When You contact us via the online contact form, the Order Form, by e-mail, phone, chat, letter or by any
          other means of communication, we collect the data exchanged between You and us, including Your contact details
          and the metadata of the communication.
        </Description>
        <Title>5. Services</Title>
        <Description>
          When You wish to interact with us in order to receive our services, we process The data that You provide to us
          voluntarily when getting in touch with us via our communication channels (including our website), from parties
          You work for, from third parties such as contractual partners, and maybe also from public sources. We process
          Your data if You are a customer or other business contact or work for one or because we wish to address You
          for your own purposes or for the purposes of a contractual partner as part of marketing or advertising
          measures. To conclude a contract with us, You are required to fulfil our Service Order Form, including various
          personal data we need to process Your service order and perform subsequent contracts with You, which may
          include Your name, Your project, address/country of domicile, user name and address You use to register,
          contact person name, e-mail address of a contact person, (billing) address, payment data (method, currency,
          bank etc., services we provide You with and terms related thereto as well as Know Your Customer (KYC) data,
          Know Your Business (KYB) data and further data relating to fraud prevention and the combating of money
          laundering and terrorist financing, export restrictions, sanctions and embargoes. Performing the contract, we
          may process data such as the calls of requests and your unique client ID. We generally keep this data from the
          last exchange between us for ten years, but at least from the end of the contract. This period may be longer
          if required for evidentiary purposes, to comply with legal or contractual requirements, or for technical
          reasons. For contacts used only for marketing and advertising, the period is usually much shorter, usually at
          most 2 years from the last contact.
        </Description>
        <Title>6. Other Data</Title>
        <Description>
          Other data may be processed in relation to administrative or judicial proceedings for security reasons, events
          or campaigns and monitoring of our physical and IT infrastructure and systems or other situations where we
          have a reason to protect our legitimate interest. The retention period for this data depends on the processing
          purpose and is limited to what is necessary.
        </Description>
        <Title>IV. Purposes of the Processing</Title>
        <Description>
          We process Your data for the purposes explained below. These purposes and their objectives represent the
          interests of us and potentially of third parties.
          <ul>
            <li>
              Website maintenance and optimization: We have an interest in providing You with a well-functioning website
              with certain functionalities. We know through which provider You access our offerings (and therefore also
              the region) because of the IP address, but usually, this does not tell us who You are because Fathom
              Analytics does not store or show any IP addresses. When you access the website, a hash is generated that
              anonymizes your personal data (IP address) while giving us minimal technical data (region, device) that we
              can see.
            </li>
            <li>
              Communication: We process Your data to communicate with You, particularly when You contact us to respond
              to Your queries or when You exercise Your rights. For this purpose, we use, in particular, communication
              data, contract data and registration data. We keep this data to document our communication with You for
              training purposes and quality assurance.
            </li>
            <li>
              Performance of a Contract: We process Your data for entering into a contract with You, perform and
              administer it and provide You with our service. For this purpose, we process communication, contract data,
              and any other You provide or request us to process it. This might include data about third parties, e.g.
              if You order products or services for the benefit of a third party (e.g. Your employer). This also
              includes data about potential customers we receive from communicating with You at a trade fair or any
              other business event. As regards the conclusion of a contract, we use this data to assess Your
              creditworthiness and to open up a business relationship with You.
            </li>
            <li>
              Marketing and Relationship Management: We process Your data for marketing and relationship management
              purposes (e.g. customer relationship management system (CRM).
            </li>
            <li>
              Risk Management, Corporate Governance and Business Development, Product/Service Improvement and
              Innovation: We process Your data for market research and to improve our products and services (including
              our website), and, as part of our risk management and corporate government, in order to protect us from
              criminal or abusive activity. We might sell businesses, parts of businesses or companies to others or,
              acquire them from others or enter into partnerships, and this might result in the exchange and processing
              of data based on Your consent, if necessary. This includes also data processing to protect our IT- and
              system infrastructure.
            </li>
            <li>
              Compliance with Law: We process Your data to comply with legal requirements, e.g. money laundering and
              terrorist financing, tax obligations, «Know Your Customer» (KYC) requirements or as otherwise required by
              law and legal authorities.
            </li>
          </ul>
        </Description>
        <Title>V. Legal Basis for Processing Your Data</Title>
        <Description>
          Where required, we rely on a legal basis for processing Your Data. Where we ask for Your consent, we process
          Your data based on such consent. You may withdraw Your consent at any time with effect for the future by
          providing us written notice (e-mail sufficient) to info@hoprnet.org. Withdrawal of Your consent does not
          affect the lawfulness of the processing that we have carried out prior to Your withdrawal, nor does it affect
          the processing of Your data based on other processing grounds. Otherwise, we may process Your data in the
          context of (i) a contractual obligation, (ii) a legal obligation, (iii) a vital interest of the data subject
          or of another natural person, (iv) to perform a public task, or (v) a legitimate interest, which includes
          compliance with applicable law and the marketing of our products and services, the interest in better
          understanding our markets and in managing and further developing our company, including its operations, safely
          and efficiently.
        </Description>
        <Title>VI. Your Rights</Title>
        <Description>
          You have various rights in relation to our processing of Your personal data, depending on the applicable data
          protection law:
          <ul>
            <li>
              Right of Access: You have the right to request a copy of the personal data that we hold about You. There
              are exceptions to this right, so that access may be denied if, for example, making the information
              available to You would reveal personal data about another person or if we are legally prevented from
              disclosing such information.
            </li>
            <li>
              Right to Rectification and Restriction: We aim to keep Your personal data accurate, current, and complete.
              We encourage You to contact us to let us know if any of Your personal data is not accurate or changes so
              that we can keep Your personal data up to date. You have further the right to ask us to restrict the
              processing of Your personal information in certain circumstances.
            </li>
            <li>
              Right to Erasure: You have the right to require us to erase Your personal data when the personal data is
              no longer necessary for the purposes for which it was collected or when, among other things, Your personal
              data has been unlawfully processed.
            </li>
            <li>
              Right to Data Portability: You have the right to ask that we transfer the personal information You gave us
              to another controller or to You in certain circumstances.
            </li>
            <li>
              Right to Withdraw Consent: Where we process data based on Your consent, You have the right to withdraw
              Your consent. Once we have received notification that You have withdrawn Your consent, we will no longer
              process Your information for the purpose(s) to which You originally consented unless there is another
              legal ground for the processing.
            </li>
            <li>
              Right to Complain: If you believe that Your data protection rights have been violated, You can contact the
              competent supervisory authority, the Federal Data Protection and Information Commissioner (FDPIC) and the
              European Union. Your local data protection supervisory authority is responsible for Your concern (see more
              details here:{' '}
              <a
                href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
                target="_blank"
                rel="noreferrer"
              >
                https://edpb.europa.eu/about-edpb/about-edpb/members_en
              </a>
              ).
            </li>
            <li>
              Right to Object: Under applicable data protection law, You have the right to object at any time to the
              processing of personal data pertaining to You under certain circumstances, in particular where Your data
              is processed in the public interest, on the basis of a balance of interests or for direct marketing
              purposes.
            </li>
          </ul>
          If You would like to exercise the above-mentioned rights, don't hesitate to contact us at info@hoprnet.org.
          Please note that we need to identify You to prevent misuse, e.g. by means of a copy of Your ID card or
          passport, unless identification is possible otherwise.
        </Description>
        <Title>VII. Data Security</Title>
        <Description>
          We take appropriate organizational and technical measures to prevent Your personal data from being
          accidentally lost, used or accessed in an unauthorized way, altered or disclosed. However, we and Your
          personal data can still become victims of cyber-attacks, cybercrime, brute force, hacker attacks and further
          fraudulent and malicious activity, including but not limited to viruses, forgeries, malfunctions and
          interruptions, which are out of our control and responsibility.
        </Description>
        <Title>VIII. Disclosure of Data to Third Parties</Title>
        <Description>
          In order to perform our contracts, fulfil our legal obligations, protect our legitimate interest and the other
          purposes and legal grounds set out above, we may disclose Your data to third parties, in particular to the
          following categories of recipients:
          <ul>
            <li>
              Wallet Provider: Please kindly note that any data processing in this context is not in our area of
              responsibility. Your data handling in the role of a wallet provider, a provider in relation to such wallet
              service or Your interactions with any third-party wallet provider is solely and exclusively governed by
              the applicable terms of service and privacy policy of the walled provider and is unaffected by this Notice
              and vice versa. This Notice is not applicable and/or subject to any data privacy rules of such third-party
              provider. However, please note that we have - by design - no access to any of Your information on the
              chain.
            </li>
            <li>
              Service Providers: We may share Your information with service providers and business partners around the
              world with whom we collaborate to fulfil the above purposes (e.g. IT providers, shipping companies,
              advertising service providers, security companies, banks, insurance companies, telecommunication
              companies, credit information agencies, address verification provider, lawyers) or who we engage to
              process personal data for any of the purposes listed above on our behalf and in accordance with our
              instructions only.
            </li>
            <li>
              Legal Authorities: If legally obliged or entitled to make disclosures or if it appears necessary to
              protect our interests, we may disclose Your data to courts, law enforcement authorities, regulators,
              government officials or other legal authorities in Switzerland or abroad, e.g. in criminal investigations
              and legal proceedings including alternative dispute resolution as well as to prevent and combat money
              laundering and terrorist financing (e.g. duties in the event of a suspicion of money laundering, duty to
              report to Money Laundering Report-ing Offices Switzerland or abroad) or due to further reporting duties.
            </li>
          </ul>
        </Description>
        <Title>IX. Transfer of Data Abroad</Title>
        <Description>
          As we have explained in Section VIII, we disclose data to other parties, not all of them located in
          Switzerland. This also applies to our presence on social networks/platforms as described below in Section X.
          Your data may be processed in the European Economic Area (EEA) and, in exceptional circumstances, also in
          countries outside the EEA and around the world, which includes countries that do not provide the same level of
          data protection as Switzerland or the EEA and are not recognized as providing an adequate level of data
          protection. We only transfer data to these countries when it is necessary for the performance of a contract or
          for the exercise or defence of legal claims, or if such transfer is based on Your explicit consent or subject
          to safeguards that assure the protection of Your data, such as the European Commission approved standard
          contractual clauses.
        </Description>
        <Title>X. Cookies</Title>
        <Description>
          We use cookies on our website [and may allow certain third parties to do so as well]. When you visit our
          website, cookies are small files that Your browser automatically creates and that are stored on Your device
          (laptop, tablet, smartphone, etc.). However, depending on the purpose of these cookies, we may ask for Your
          express prior consent before they are used. You can withdraw Your consent under the same link at any time. You
          can also set Your browser to block or deceive certain types of cookies or alternative technologies or to
          delete existing cookies, adding software to Your browser that blocks certain third-party tracking. Please
          learn more on the help pages of Your or on the websites of the third parties.
          <ul>
            <li>
              Necessary Cookies: Necessary cookies are necessary for the functioning of the website or for certain
              features. They make the use of our website more pleasant for You. For example, they help make a website
              usable by enabling basic functions such as page navigation and access to secure areas of the website. They
              also ensure that You can move between pages without losing information entered in a form and stay logged
              in. These cookies exist temporarily only («session cookies») and are automatically deleted after leaving
              our pages. If You block them, the website may not work properly. Other cookies are necessary for the
              server to store options or information (which You have entered) beyond a session (i.e. a visit to the
              website) if You use this function (for example, language settings, consents, automatic login
              functionality, etc.). These cookies have an expiration date of up to [12] months. The legal basis for such
              cookies is our legitimate interest according to providing You with all functions of our website. A list of
              necessary cookies is provided in our Consent Management Tool.
            </li>
          </ul>
        </Description>
        <Title>XI. How Long We Keep Your Personal Data</Title>
        <Description>
          We only process Your data for as long as necessary to fulfil the purposes we collected it for, including for
          the purposes of complying with legal retention requirements and, where required to assert or defend against
          legal claims, until the end of the relevant retention period or until the claims in question have been
          settled. Upon expiry of the applicable retention period, we will securely destroy Your data in accordance with
          applicable laws and regulations. Contract data
        </Description>
      </StyledContainer>
    </Section>
  );
};

export default PrivacyNotice;
