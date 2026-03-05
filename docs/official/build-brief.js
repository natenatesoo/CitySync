const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, LevelFormat, BorderStyle, Header, Footer,
  PageNumber, ShadingType, WidthType, Table, TableRow, TableCell
} = require('docx');
const fs = require('fs');

const ACCENT = "1F4E79";
const LIGHT_BG = "EBF3FA";
const RULE_COLOR = "1F4E79";

function rule() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE_COLOR, space: 1 } },
    spacing: { after: 160 },
    children: []
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 28, color: ACCENT })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 24, color: "2E2E2E" })]
  });
}

function body(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}

function boldInline(bold, rest) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children: [
      new TextRun({ text: bold, bold: true, font: "Arial", size: 22 }),
      new TextRun({ text: rest, font: "Arial", size: 22 })
    ]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}

function callout(lines) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "AACDE8" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cellChildren = lines.map(l =>
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: l, font: "Arial", size: 20, italics: true, color: "1F4E79" })]
    })
  );
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      borders,
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: cellChildren
    })] })]
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "2E2E2E" },
        paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]},
      { reference: "numbers", levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]}
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 1 } },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "City/Sync  ", font: "Arial", size: 18, bold: true, color: ACCENT }),
            new TextRun({ text: "Project Brief", font: "Arial", size: 18, color: "666666" }),
            new TextRun({ text: "\tConfidential \u2014 Internal Use", font: "Arial", size: 18, color: "999999", italics: true }),
          ],
          tabStops: [{ type: "right", position: 9360 }]
        })
      ]})
    },
    footers: {
      default: new Footer({ children: [
        new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 1 } },
          spacing: { before: 80 },
          children: [
            new TextRun({ text: "City/Sync Project Brief", font: "Arial", size: 18, color: "999999" }),
            new TextRun({ text: "\tPage ", font: "Arial", size: 18, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" }),
          ],
          tabStops: [{ type: "right", position: 9360 }]
        })
      ]})
    },
    children: [

      // ── TITLE BLOCK ──────────────────────────────────────────────────
      new Paragraph({
        spacing: { before: 240, after: 60 },
        children: [new TextRun({ text: "City/Sync", font: "Arial", size: 56, bold: true, color: ACCENT })]
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "Project Brief", font: "Arial", size: 32, color: "444444" })]
      }),
      new Paragraph({
        spacing: { after: 320 },
        children: [new TextRun({ text: "Internal alignment document \u2014 March 2026", font: "Arial", size: 20, color: "888888", italics: true })]
      }),
      rule(),

      // ── 1. OVERVIEW ──────────────────────────────────────────────────
      h1("1. Overview"),
      body("City/Sync builds programmable coordination infrastructure that makes civic contribution visible, valuable, and integrable into real public and community pathways."),
      body("The core thesis is simple: the world\u2019s economy optimizes for what can be measured and priced, while a massive share of human effort that keeps societies functioning remains structurally invisible. City/Sync exists to close that gap \u2014 not by replacing government, but by equipping civic institutions with the tools to recognize, coordinate, and reward the civic energy that already exists."),
      body("At its heart, City/Sync operates across two complementary domains: a market economy (priced, competitive, profit-driven) and a civic economy (contribution-based, public-purpose, governed collectively). These two circuits are not adversaries \u2014 they serve different functions. City/Sync builds the infrastructure for the civic circuit, giving it the same legibility, accountability, and integration that the market circuit already has."),
      spacer(),

      // ── 2. CONTEXT ───────────────────────────────────────────────────
      h1("2. Context and Rationale"),
      body("Today\u2019s dominant economic and administrative systems treat unpaid contribution as marginal. Yet civic contribution at scale is not marginal \u2014 it is foundational:"),
      bullet("An estimated 2.1 billion people engage in volunteering activity monthly worldwide (roughly one in four people)."),
      bullet("Most volunteering does not move through formal institutions: roughly 32% through organizations and 68% peer-to-peer (neighbors, families, communities)."),
      bullet("If unpaid care and domestic work were counted as an industry, it would rank among the top 3 largest sectors globally, estimated at ~$11T (around 9% of global GDP)."),
      spacer(),
      body("This is not just a measurement problem. It creates a structural blind spot in how cities plan, budget, govern, and build long-term civic capacity. What isn\u2019t visible can\u2019t be planned around \u2014 and what can\u2019t be planned around doesn\u2019t compound into durable civic infrastructure."),
      body("A second structural pressure compounds this: accelerating automation is eroding the wage-labor relationship that historically linked economic participation to civic inclusion. As employment contracts as a mechanism of social belonging, cities need new ways to recognize contribution, build identity around civic life, and sustain the civic infrastructure that markets have never been able to price. City/Sync is designed for exactly this moment."),
      spacer(),

      // ── 3. THE PROBLEM ───────────────────────────────────────────────
      h1("3. The Problem"),
      body("City/Sync is designed around three structural challenges that show up repeatedly across cities:"),
      spacer(),
      h2("Problem 1: Civic value exists, but it is invisible."),
      body("Non-market contributions \u2014 care work, volunteering, mutual aid, neighborhood stewardship \u2014 are real and essential. But because they are not priced, they remain invisible to the systems that allocate resources and make decisions. What is not visible cannot be planned around, and what cannot be planned around does not compound into durable civic capacity."),
      spacer(),
      h2("Problem 2: Civic energy exists, but institutions cannot integrate it."),
      body("Cities are full of capable, engaged people, but they suffer from a lack of mechanisms to absorb, coordinate, verify, and account for distributed civic action. As a result, participation stays informal, fragile, and disconnected from institutional trust and execution. Local governments are not resistant to civic partnership \u2014 they are structurally unable to absorb it. Twenty to thirty percent of municipal budgets in many cities go to pensions and retirement obligations, growing year by year. They are looking for solutions."),
      spacer(),
      h2("Problem 3: Governance structures were built for another era."),
      body("Authority concentrates inside agencies and execution flows top-down, creating throughput limits: bottlenecks, slow response, coordination friction, and opacity \u2014 especially around local, high-variance problems. Digitalization has improved access but often preserves the same power structure, leaving trust and meaningful participation largely unchanged. The systems that were built to manage civic life have, over time, taught citizens how not to participate in it."),
      spacer(),

      // ── 4. WHO IT\u2019S FOR ────────────────────────────────────────────────
      h1("4. Who City/Sync Is For"),
      body("City/Sync is built at the intersection of four groups:"),
      spacer(),
      boldInline("Citizens and participants \u2014 ", "who contribute meaningfully but lack clear pathways for their work to be visible, coordinated, and valued. Governance participation follows contribution, not legal citizenship status."),
      boldInline("Civic organizations and nonprofits \u2014 ", "doing essential work with limited resources, often in silos, lacking structured mechanisms to demonstrate impact to funders and the public."),
      boldInline("Public institutions and local governments \u2014 ", "that want to collaborate with communities but lack structured mechanisms to integrate civic contribution into administrative and budgetary reality."),
      boldInline("Mission-aligned businesses \u2014 ", "willing to support public value but lacking clear, fair, low-friction ways to participate in civic ecosystems."),
      spacer(),
      body("City/Sync is built for cities facing rising complexity, higher civic expectations, and constrained administrative capacity."),
      spacer(),

      // ── 5. PURPOSE / MISSION / VISION ────────────────────────────────
      h1("5. Purpose, Mission, and Vision"),
      spacer(),
      callout([
        "Purpose: Reimagining how cities value, coordinate, and govern civic life.",
        "",
        "Mission: Build programmable coordination infrastructure that enables cities to measure, execute, and recognize civic contribution through transparent, rule-based systems integrated within existing public structures.",
        "",
        "Vision: Cities where public administration becomes a participatory, measurable system of collective action \u2014 one that citizens can join, trust, and help govern. By coordinating institutional authority with community contribution through a shared coordination layer, civic work becomes visible, accountable, and redeemable across real service domains. Over time, cities evolve into continuous coordination networks that interoperate globally, forming a commons-based system for producing public value through Decentralized Public Administration Networks (dPANs)."
      ]),
      spacer(),

      // ── 6. THE SOLUTION ──────────────────────────────────────────────
      h1("6. The Solution"),
      body("City/Sync delivers three interlocking components:"),
      spacer(),

      h2("A. The Civic Credit System"),
      body("At the center of City/Sync is a simple, powerful exchange: contribute civic labor, earn civic credits, redeem those credits for access to public goods, club goods, and community services."),
      body("A note on terminology: we use \u201ccivic credit\u201d as the primary concept. Each city\u2019s credit carries its own local name \u2014 a placeholder we call $CITY in technical documentation. This label is intentionally generic: it is not a cryptocurrency, not a speculative asset, and not a transferable financial instrument. It is a unit of account for civic contribution, local in scope and purpose. When presenting to non-technical audiences, \u201ccivic credit\u201d or the city\u2019s chosen local name should be used in preference to any token notation."),
      body("Two on-chain assets underpin the system:"),
      spacer(),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "Civic Credits (the city\u2019s own name, e.g. $OAK, $MEX, or simply \u201ccredits\u201d)", bold: true, font: "Arial", size: 22 })]
      }),
      bullet("Earned exclusively through verified civic labor \u2014 completing tasks defined and overseen by issuing organizations."),
      bullet("Non-transferable: credits cannot be sold, traded, or gifted. They belong to the person who earned them through contribution."),
      bullet("Redeemable at approved organizations for access to public goods (transit, libraries, parks programs) and club goods (community events, local business offers, cultural institutions)."),
      bullet("Burned upon redemption, ensuring each credit represents one completed cycle of contribution \u2014 not a perpetually circulating asset."),
      spacer(),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "Governance Credits ($VOTE)", bold: true, font: "Arial", size: 22 })]
      }),
      bullet("Issued one-for-one with every civic credit earned."),
      bullet("Non-transferable: governance power follows contribution and cannot be purchased or delegated."),
      bullet("Used for three governance functions: dPAN management, public proposals, and participatory budgeting."),
      bullet("The more you contribute to your community, the more influence you hold over how it is governed."),
      spacer(),
      body("This architecture deliberately keeps the system simple. There are no intermediate currencies, no complex financial layers, and no speculative mechanisms. Contribution in, access out \u2014 governed by those who participate."),
      spacer(),

      h2("B. The Administrative Framework"),
      body("A structured set of roles, procedures, verification patterns, and redemption models that give civic coordination the same operational rigor as any formal administrative system:"),
      boldInline("Issuers \u2014 ", "organizations that define civic tasks, verify completion, and authorize credit issuance."),
      boldInline("Civic Participants \u2014 ", "residents who claim and complete tasks, earn credits and governance power, and participate in system governance."),
      boldInline("Redeemers \u2014 ", "approved organizations that accept civic credits in exchange for goods and services, operating within a defined redemption registry."),
      boldInline("Governance Committees \u2014 ", "polycentric, representative bodies (Issuer, Redeemer, and Civic Participant committees) that set task catalogs, redemption eligibility, and system parameters."),
      spacer(),
      body("The net benefit to local governments is direct: every unit of civic labor that offsets a previously paid administrative function is a dollar that does not need to be raised through taxation or debt. Because participating organizations control what is offered in redemption and at what rate, the system is structurally low-risk for any institution that joins it."),
      spacer(),

      h2("C. The Technology Stack"),
      body("A standardized, replicable, open-source technology stack built on a local Proof-of-Authority (POA) blockchain \u2014 governed by trusted local institutions (universities, nonprofits, municipal agencies) acting as validators. The stack is designed to be lightweight, auditable, and forkable by any city. It handles issuance, verification, redemption, and governance in a single integrated system \u2014 removing the coordination friction that currently prevents civic contribution from being absorbed by institutions."),
      spacer(),

      // ── 7. THE PILOT ─────────────────────────────────────────────────
      h1("7. The First Step: Dual-City Pilot"),
      body("The vision is ambitious, so City/Sync starts with a focused pilot designed to prove that programmable civic coordination can function inside real city environments."),
      spacer(),
      h2("Pilot Locations"),
      bullet("Berkeley, California, USA"),
      bullet("Mexico City, Mexico"),
      spacer(),
      h2("Pilot Format"),
      body("A mobile application that activates a practical coordination loop across three roles:"),
      spacer(),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "Role 1: Issuers", bold: true, font: "Arial", size: 22 })]
      }),
      body("Organizations that define civic activities and translate their mission into clear, structured tasks inside the app. Examples: adoption events, park cleanups, community workshops, data verification initiatives."),
      spacer(),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "Role 2: Civic Participants", bold: true, font: "Arial", size: 22 })]
      }),
      body("Residents who claim and complete civic tasks. After completion and issuer verification, participants receive civic credits and governance credits in equal measure."),
      spacer(),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "Role 3: Redeemers", bold: true, font: "Arial", size: 22 })]
      }),
      body("Organizations that offer goods and services in recognition of verified civic contribution. Examples: transit passes, museum access, library fee waivers, public event tickets, local business offers. Credits are burned upon redemption \u2014 ensuring they represent completed cycles of contribution, not a perpetually circulating asset."),
      spacer(),
      callout([
        "Core principle: If you give to your community, your community gives back.",
        "",
        "Five anti-coercion guarantees embedded in the pilot design:",
        "1. Participation is always voluntary.",
        "2. Civic credits never substitute for paid employment.",
        "3. Survival is never made dependent on earning credits.",
        "4. Access to tasks is universal \u2014 no eligibility gatekeeping.",
        "5. Redemption options are equitable \u2014 no second-class participation."
      ]),
      spacer(),

      // ── 8. PAIN POINTS ───────────────────────────────────────────────
      h1("8. Pilot Pain Points Addressed"),
      body("The pilot is designed around real constraints faced by participants, issuers, and redeemers today:"),
      bullet("Unreliable volunteer capacity and weak retention loops"),
      bullet("Lack of administrative mechanisms to define, verify, and account for civic contributions"),
      bullet("Legitimacy challenges in proving impact to funders, partners, and the public"),
      bullet("Civic work that remains informal, invisible, and hard to sustain"),
      bullet("Supporting organizations need a fair, low-friction, predictable way to offer access to their goods and services without operational strain or open-ended financial liability"),
      bullet("Local governments constrained by rising pension obligations and shrinking discretionary budgets, looking for ways to do more without spending more"),
      spacer(),

      // ── 9. OBJECTIVES ────────────────────────────────────────────────
      h1("9. Pilot Objective and Success Criteria"),
      h2("General Objective"),
      body("Demonstrate that programmable civic coordination can operate as a real administrative capability inside existing city pathways \u2014 not as a political reform or abstract experiment, but as a practical, integrated coordination layer that institutions can observe, trust, and replicate."),
      spacer(),
      h2("Success Looks Like"),
      numbered("The coordination layer functions inside real institutional environments (issuers, redeemers, and participants using it end-to-end)."),
      numbered("A repeatable administrative pattern is established (roles, verification, redemption, governance procedures that can be reused across cities)."),
      numbered("The issuer and redeemer ecosystem expands through active deployment (growing the network organically)."),
      numbered("A full implementation blueprint is produced (onboarding protocols, agreements, verification models, redemption structures, governance procedures) enabling replication."),
      numbered("Measurable social and financial impact data is collected and published \u2014 creating the evidentiary foundation for expansion to additional cities."),
      spacer(),

      // ── 10. SCALING VISION ───────────────────────────────────────────
      h1("10. The Scaling Vision"),
      body("City/Sync is designed as a research and development layer for the next generation of civic governance. The pilot is not an end in itself \u2014 it is the first proof point in a city-by-city accumulation of evidence and infrastructure."),
      body("Every successful pilot becomes leverage. The open-source stack can be forked and adapted by any city. Proven administrative patterns can be shared across jurisdictions. And as the network of participating cities grows, inter-city interoperability becomes possible \u2014 allowing civic identity, contribution records, and governance participation to travel with residents across geographies."),
      body("The long-term horizon is Decentralized Public Administration Networks (dPANs): modular, community-governed applications that mirror and eventually absorb specific government functions \u2014 not by replacing government, but by distributing it. Every department, every public works function, every service domain becomes a candidate for a dPAN built on a local chain governed by the people it serves."),
      spacer(),

      // ── 11. CLOSING ──────────────────────────────────────────────────
      h1("11. Closing Statement"),
      body("City/Sync does not try to create civic energy. It already exists at massive scale \u2014 2.1 billion people volunteering monthly, trillions in unpriced care and community labor, entire neighborhoods organizing without institutional recognition or support."),
      body("City/Sync makes that value visible, structured, trustworthy, and scalable. It turns invisible civic labor into coordinated public capacity that can be integrated into how cities operate, measured, governed, and improved over time."),
      body("This is not a company. It is not a crypto experiment. It is a process \u2014 a transitory framework that helps governments and citizens gradually move toward decentralized governance in a responsible way. Because we cannot throw out our institutions and hope something better emerges. We have to evolve carefully, deliberately, and together."),
      spacer(),
      rule(),
      new Paragraph({
        spacing: { before: 120 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "City/Sync \u2014 citysync.org", font: "Arial", size: 18, color: "888888", italics: true })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/sessions/gracious-vigilant-thompson/mnt/dev/citysync/docs/official/City_Sync Project Brief (Improved).docx', buf);
  console.log('Done');
});
