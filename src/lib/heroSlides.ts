import { supabase } from './supabase';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  ctaLink?: string;
  order_index?: number;
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching hero slides:", error);
    return [];
  }

  if (data && data.length > 0) {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      image: item.image,
      cta: item.cta,
      ctaLink: item.cta_link,
      order_index: item.order_index
    }));
  }

  return [];
}

export async function saveHeroSlide(slide: Omit<HeroSlide, 'id'>, id?: string) {
  if (id && id.startsWith('slide-') === false) { // Assuming old format 'slide-X' won't exist in Supabase UUID 
    // It's an update
    const { error } = await supabase
      .from('hero_slides')
      .update({
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
        cta: slide.cta,
        cta_link: slide.ctaLink || null,
        order_index: slide.order_index || 0
      })
      .eq('id', id);

    if (error) throw error;
  } else {
    // Insert new
    const { error } = await supabase
      .from('hero_slides')
      .insert([{
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
        cta: slide.cta,
        cta_link: slide.ctaLink || null,
        order_index: slide.order_index || 0
      }]);

    if (error) throw error;
  }
  
  window.dispatchEvent(new Event('hero-slides-updated'));
}

export async function deleteHeroSlide(id: string) {
  const { error } = await supabase
    .from('hero_slides')
    .delete()
    .eq('id', id);

  if (error) throw error;
  window.dispatchEvent(new Event('hero-slides-updated'));
}

export async function updateHeroSlidesOrder(orderedIds: string[]) {
  const updates = orderedIds.map((id, index) => 
    supabase.from('hero_slides').update({ order_index: index }).eq('id', id)
  );
  
  await Promise.all(updates);
  window.dispatchEvent(new Event('hero-slides-updated'));
}
