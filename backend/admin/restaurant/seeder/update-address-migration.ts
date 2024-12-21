import type { AddressType } from "../../../../types";

const asabaBounds = {
	north: 6.25,
	south: 6.1,
	east: 6.8,
	west: 6.65,
};

const areas = [
	"Okpanam Road", "Nnebisi Road", "Summit Road", "DLA Road", "Jesus Saves Road",
	"Dennis Osadebe Way", "Mariam Babangida Way", "Ibusa Road", "Cable Point",
	"Core Area", "Infant Jesus", "West End", "GRA", "Bonsaac"
];

const streetNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const streetTypes = ["Street", "Close", "Avenue", "Road", "Lane"];
const landmarks = ['Bank', 'School', 'Market', 'Church', 'Park', 'Shopping Mall', 'Hospital', 'Police Station'];

export function generateRandomCoordinates() {
	const lat = Number((Math.random() * (asabaBounds.north - asabaBounds.south) + asabaBounds.south).toFixed(6));
	const lng = Number((Math.random() * (asabaBounds.east - asabaBounds.west) + asabaBounds.west).toFixed(6));
	return { lat, lng };
}

export function generateRandomLocation() {
	const area = areas[Math.floor(Math.random() * areas.length)];
	const number = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
	const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
	return `${number} ${area} ${streetType}, Asaba, Delta State`;
}

export function generateAddress(): AddressType {
	const coordinates = generateRandomCoordinates();
	return {
		label: "Main Branch",
		location: generateRandomLocation(),
		coordinates,
		additionalDetails: `Near ${landmarks[Math.floor(Math.random() * landmarks.length)]}`,
	};
}