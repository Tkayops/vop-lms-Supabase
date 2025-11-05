// SDA Church Hierarchy for Kenya
// Structure: Union → Conference → Church

export const kenyaUnions = [
  {
    id: "kenya-coast",
    name: "Kenya Coast Union",
    conferences: [
      {
        id: "coast-central",
        name: "Coast Central Conference",
        churches: [
          { id: "mombasa-central", name: "Mombasa Central SDA Church", county: "Mombasa" },
          { id: "likoni", name: "Likoni SDA Church", county: "Mombasa" },
          { id: "kilifi-town", name: "Kilifi Town SDA Church", county: "Kilifi" },
          { id: "malindi", name: "Malindi SDA Church", county: "Kilifi" },
        ]
      },
      {
        id: "south-coast",
        name: "South Coast Conference",
        churches: [
          { id: "kwale-central", name: "Kwale Central SDA Church", county: "Kwale" },
          { id: "diani", name: "Diani SDA Church", county: "Kwale" },
          { id: "voi", name: "Voi SDA Church", county: "Taita Taveta" },
        ]
      }
    ]
  },
  {
    id: "kenya-central",
    name: "Kenya Central Union",
    conferences: [
      {
        id: "nairobi-central",
        name: "Nairobi Central Conference",
        churches: [
          { id: "nairobi-central-church", name: "Nairobi Central SDA Church", county: "Nairobi" },
          { id: "jericho", name: "Jericho SDA Church", county: "Nairobi" },
          { id: "embakasi", name: "Embakasi SDA Church", county: "Nairobi" },
          { id: "buruburu", name: "Buruburu SDA Church", county: "Nairobi" },
          { id: "umoja", name: "Umoja SDA Church", county: "Nairobi" },
        ]
      },
      {
        id: "kiambu",
        name: "Kiambu Conference",
        churches: [
          { id: "thika-town", name: "Thika Town SDA Church", county: "Kiambu" },
          { id: "ruiru", name: "Ruiru SDA Church", county: "Kiambu" },
          { id: "kikuyu", name: "Kikuyu SDA Church", county: "Kiambu" },
          { id: "limuru", name: "Limuru SDA Church", county: "Kiambu" },
        ]
      },
      {
        id: "central-kenya",
        name: "Central Kenya Conference",
        churches: [
          { id: "nyeri-central", name: "Nyeri Central SDA Church", county: "Nyeri" },
          { id: "karatina", name: "Karatina SDA Church", county: "Nyeri" },
          { id: "embu-town", name: "Embu Town SDA Church", county: "Embu" },
          { id: "meru-town", name: "Meru Town SDA Church", county: "Meru" },
        ]
      }
    ]
  },
  {
    id: "kenya-lake",
    name: "Kenya Lake Union",
    conferences: [
      {
        id: "kisumu",
        name: "Kisumu Conference",
        churches: [
          { id: "kisumu-central", name: "Kisumu Central SDA Church", county: "Kisumu" },
          { id: "kondele", name: "Kondele SDA Church", county: "Kisumu" },
          { id: "siaya", name: "Siaya SDA Church", county: "Siaya" },
          { id: "bondo", name: "Bondo SDA Church", county: "Siaya" },
        ]
      },
      {
        id: "south-nyanza",
        name: "South Nyanza Conference",
        churches: [
          { id: "migori-town", name: "Migori Town SDA Church", county: "Migori" },
          { id: "homa-bay", name: "Homa Bay SDA Church", county: "Homa Bay" },
          { id: "kisii-central", name: "Kisii Central SDA Church", county: "Kisii" },
        ]
      }
    ]
  },
  {
    id: "kenya-highlands",
    name: "Kenya Highlands Union",
    conferences: [
      {
        id: "rift-valley",
        name: "Rift Valley Conference",
        churches: [
          { id: "nakuru-central", name: "Nakuru Central SDA Church", county: "Nakuru" },
          { id: "eldoret-town", name: "Eldoret Town SDA Church", county: "Uasin Gishu" },
          { id: "kericho-town", name: "Kericho Town SDA Church", county: "Kericho" },
          { id: "naivasha", name: "Naivasha SDA Church", county: "Nakuru" },
        ]
      },
      {
        id: "nandi",
        name: "Nandi Conference",
        churches: [
          { id: "kapsabet", name: "Kapsabet SDA Church", county: "Nandi" },
          { id: "mosoriot", name: "Mosoriot SDA Church", county: "Nandi" },
        ]
      }
    ]
  }
];

// Helper function to get all churches
export const getAllChurches = () => {
  const churches = [];
  kenyaUnions.forEach(union => {
    union.conferences.forEach(conference => {
      conference.churches.forEach(church => {
        churches.push({
          ...church,
          conferenceName: conference.name,
          conferenceId: conference.id,
          unionName: union.name,
          unionId: union.id
        });
      });
    });
  });
  return churches;
};

// Helper function to get church by ID
export const getChurchById = (churchId) => {
  for (const union of kenyaUnions) {
    for (const conference of union.conferences) {
      const church = conference.churches.find(c => c.id === churchId);
      if (church) {
        return {
          ...church,
          conferenceName: conference.name,
          conferenceId: conference.id,
          unionName: union.name,
          unionId: union.id
        };
      }
    }
  }
  return null;
};

// Helper function to get conference by ID
export const getConferenceById = (conferenceId) => {
  for (const union of kenyaUnions) {
    const conference = union.conferences.find(c => c.id === conferenceId);
    if (conference) {
      return {
        ...conference,
        unionName: union.name,
        unionId: union.id
      };
    }
  }
  return null;
};

// Helper function to get union by ID
export const getUnionById = (unionId) => {
  return kenyaUnions.find(u => u.id === unionId);
};
