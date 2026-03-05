// Curated Unsplash imagery (stable image IDs instead of source.unsplash random endpoint).
// Fallback visuals are handled by SmartImage to avoid broken UI if any URL fails.

export const HERO_LAB_IMAGE = 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=1920&q=80';

const EXPERT_IMAGE_MAP = {
  1: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=720&q=80',
  2: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=720&q=80',
  3: 'https://images.unsplash.com/photo-1629909613654-28e37726ad83?auto=format&fit=crop&w=720&q=80',
};

const LAB_IMAGE_MAP = {
  1: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1600&q=80',
  2: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80',
  3: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
  4: 'https://images.unsplash.com/photo-1581093588401-3f3cc1f8f0f4?auto=format&fit=crop&w=1600&q=80',
};

export function getExpertImage(expert) {
  const id = Number(expert?.id);
  return EXPERT_IMAGE_MAP[id] || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=720&q=80';
}

export function getLabImage(lab) {
  const id = Number(lab?.id);
  return LAB_IMAGE_MAP[id] || 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=1600&q=80';
}
